/**
 * ============================================
 * usePassiveCapture - Passive Face Capture Hook
 * ============================================
 * 
 * ARSIKTURE BARU: Client-side hanya untuk capture foto
 * Seluruh proses AI (embedding, comparison) dilakukan di SERVER (RTX 5090)
 * 
 * Flow:
 * 1. ML Kit validasi ada wajah (bukan gesture/liveness)
 * 2. Auto-capture foto terbaik saat wajah stabil
 * 3. Resize ke 480x480, JPEG 80%
 * 4. Return resized photo path + NIP
 * 5. Upload ke server untuk processing AI
 */

import { useState, useCallback, useRef } from 'react';
import { Camera, PhotoFile } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import axios from 'axios';

// ============ ML KIT FACE DETECTION ============
let FaceDetection: any = null;
try {
    FaceDetection = require('@react-native-ml-kit/face-detection').default;
} catch (e) {
    console.warn('⚠️ ML Kit tidak tersedia - akan skip face detection');
}

// ============ TYPES ============
export interface CapturedPhoto {
    imagePath: string;      // Path foto hasil resize
    originalPath: string;   // Path foto asli
    fileSize: number;       // Ukuran file dalam bytes
    width: number;          // 480
    height: number;         // 480
    timestamp: string;      // ISO timestamp
}

export interface UsePassiveCaptureReturn {
    // State
    capturedPhoto: CapturedPhoto | null;
    isCapturing: boolean;
    captureError: string | null;
    detectionStatus: string;
    
    // Functions
    capturePhoto: (cameraRef: any, nip: string) => Promise<CapturedPhoto | null>;
    clearCapture: () => void;
}

// ============ UPLOAD RESULT ============
export interface UploadResult {
    success: boolean;
    message: string;
    data?: any;
}

// ============ CONSTANTS ============
const TARGET_SIZE = 480;           // 480x480 pixel (square)
const JPEG_QUALITY = 80;           // 80% quality
const FACE_SIZE_MIN = 80;          // Minimum face size in pixels (too small = too far)
const FACE_SIZE_MAX = 600;         // Maximum face size in pixels (too close)

// ============ HELPER FUNCTIONS ============

/**
 * Resize gambar ke 480x480, JPEG 80%
 */
const resizeImage = async (imagePath: string): Promise<string> => {
    let cleanPath = imagePath;
    if (!cleanPath.startsWith('file://')) {
        cleanPath = 'file://' + imagePath;
    }

    // Gunakan path yang sama dengan file asli untuk avoid directory issues
    const outputPath = imagePath.replace(/\.[^.]+$/, '_resized.jpg');

    try {
        const response = await ImageResizer.createResizedImage(
            cleanPath,
            TARGET_SIZE,
            TARGET_SIZE,
            'JPEG',
            JPEG_QUALITY,
            0,
            outputPath,
            true,
            { mode: 'cover' as const }
        );

        console.log('✅ Resize berhasil:', response.uri);
        return response.uri;
    } catch (error) {
        console.warn('⚠️ Resize failed, using original (with file://):', error);
        // Fallback: return original path dengan file:// prefix
        return cleanPath;
    }
};

/**
 * Deteksi wajah dengan ML Kit
 * Return: face info atau null jika tidak ada wajah
 */
const detectFace = async (imagePath: string): Promise<{
    hasFace: boolean;
    faceCount: number;
    faceSize: number;
    bounds: { x: number; y: number; width: number; height: number };
} | null> => {
    if (!FaceDetection || !FaceDetection.detect) {
        console.warn('⚠️ ML Kit tidak tersedia - skip detection');
        return null;
    }

    try {
        let detectionPath = imagePath;
        if (!detectionPath.startsWith('file://')) {
            detectionPath = 'file://' + detectionPath;
        }

        const faces = await FaceDetection.detect(detectionPath, {
            performanceMode: 'accurate',
            landmarkMode: 'none',
            contourMode: 'none',
            classificationMode: 'none',
        });

        if (!faces || faces.length === 0) {
            return { hasFace: false, faceCount: 0, faceSize: 0, bounds: { x: 0, y: 0, width: 0, height: 0 } };
        }

        // Ambil wajah terbesar
        let largestFace = faces[0];
        let maxArea = 0;

        for (const face of faces) {
            const bounds = face.bounds || face.frame || {};
            const area = (bounds.width || 0) * (bounds.height || 0);
            if (area > maxArea) {
                maxArea = area;
                largestFace = face;
            }
        }

        const bounds = largestFace.bounds || largestFace.frame || {};
        const faceWidth = bounds.width || 0;
        const faceHeight = bounds.height || 0;
        const faceSize = Math.min(faceWidth, faceHeight);

        return {
            hasFace: true,
            faceCount: faces.length,
            faceSize: faceSize,
            bounds: {
                x: bounds.x || bounds.left || 0,
                y: bounds.y || bounds.top || 0,
                width: faceWidth,
                height: faceHeight,
            },
        };
    } catch (error) {
        console.error('❌ Face detection error:', error);
        return null;
    }
};

/**
 * Cleanup temporary files
 */
const cleanupFiles = async (...paths: (string | null | undefined)[]): Promise<void> => {
    for (const path of paths) {
        if (!path) continue;
        try {
            const cleanPath = String(path).startsWith('file://') 
                ? String(path).replace('file://', '') 
                : String(path);
            if (await RNFS.exists(cleanPath)) {
                await RNFS.unlink(cleanPath);
                console.log('🗑️ Cleanup:', cleanPath);
            }
        } catch (e) {
            // Silent fail
        }
    }
};

// ============ MAIN HOOK ============
export const usePassiveCapture = (): UsePassiveCaptureReturn => {
    const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureError, setCaptureError] = useState<string | null>(null);
    const [detectionStatus, setDetectionStatus] = useState('📷 Arahkan wajah ke kamera');

    // Track stabilitas wajah
    const faceHistoryRef = useRef<boolean[]>([]);
    const originalPhotoRef = useRef<string | null>(null);

    /**
     * Ambil foto dengan validasi wajah sederhana
     */
    const capturePhoto = useCallback(async (
        cameraRef: any,
        nip: string
    ): Promise<CapturedPhoto | null> => {
        if (!cameraRef?.current) {
            setCaptureError('Kamera tidak tersedia');
            return null;
        }

        try {
            setIsCapturing(true);
            setCaptureError(null);
            setDetectionStatus('🔍 Mendeteksi wajah...');
            
            // Reset history
            faceHistoryRef.current = [];

            // Step 1: Ambil foto dari kamera
            console.log('📸 Mengambil foto...');
            
            let photo: PhotoFile;
            try {
                photo = await cameraRef.current.takePhoto({
                    flash: 'off',
                } as any);
            } catch (photoError: any) {
                // Jika camera timeout, coba lagi sekali
                console.warn('⚠️ Photo capture timeout, retrying...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                photo = await cameraRef.current.takePhoto({
                    flash: 'off',
                } as any);
            }

            if (!photo?.path) {
                throw new Error('Gagal mengambil foto');
            }

            const originalPath = photo.path;
            originalPhotoRef.current = originalPath;

            // Step 2: Validasi wajah dengan ML Kit
            setDetectionStatus('✅ Memproses foto...');
            const faceResult = await detectFace(originalPath);

            // Validasi jumlah wajah
            if (faceResult && faceResult.faceCount > 1) {
                await cleanupFiles(originalPath);
                setCaptureError('⚠️ Hanya satu wajah yang boleh ada di frame');
                return null;
            }

            // Validasi ukuran wajah (hanya minimum, tidak ada maksimum)
            if (faceResult && faceResult.faceSize < FACE_SIZE_MIN) {
                await cleanupFiles(originalPath);
                setCaptureError(`Wajah terlalu kecil (${faceResult.faceSize}px). Dekatkan wajah ke kamera.`);
                return null;
            }
            // CATATAN: Dihapus validasi "too close" karena tidak konsisten di berbagai device
            // Lebih baik foto sedikit dekat daripada terlalu jauh

            console.log('✅ Face validated:', faceResult?.faceCount, 'face(s), size:', faceResult?.faceSize, 'px');

            // Step 3: Resize ke 480x480
            setDetectionStatus('📐 Mengubah ukuran gambar...');
            let resizedPath = await resizeImage(originalPath);
            
            // Pastikan path memiliki file:// prefix
            if (!resizedPath.startsWith('file://')) {
                resizedPath = 'file://' + resizedPath;
            }
            
            console.log('📷 Resized path:', resizedPath);
            console.log('📷 Original path:', originalPath);

            // Step 4: Check apakah resize berhasil (path berbeda dari original)
            const isResizeSuccessful = resizedPath !== originalPath && 
                                         resizedPath !== 'file://' + originalPath;
            
            // Step 5: Hitung ukuran file
            let fileSize = 0;
            const cleanResizedPath = resizedPath.startsWith('file://') 
                ? resizedPath.replace('file://', '') 
                : resizedPath;
            try {
                const stat = await RNFS.stat(cleanResizedPath);
                fileSize = stat.size;
            } catch (e) {
                fileSize = 0;
            }

            // Step 6: Cleanup - JANGAN cleanup jika resize gagal!
            if (isResizeSuccessful) {
                // Resize berhasil, cleanup original
                await cleanupFiles(originalPath);
            } else {
                // Resize gagal, gunakan original
                resizedPath = originalPath.startsWith('file://') 
                    ? originalPath 
                    : 'file://' + originalPath;
                console.log('📷 Using original photo (resize failed)');
            }

            // Step 6: Return result
            const result: CapturedPhoto = {
                imagePath: resizedPath,
                originalPath: originalPath,
                fileSize: fileSize,
                width: TARGET_SIZE,
                height: TARGET_SIZE,
                timestamp: new Date().toISOString(),
            };

            setCapturedPhoto(result);
            setDetectionStatus('✅ Foto siap dikirim ke server');
            console.log('✅ Capture selesai:', `${(fileSize / 1024).toFixed(1)} KB`);
            console.log('📷 Foto path:', resizedPath);
            console.log('📷 Foto exists:', await RNFS.exists(resizedPath.replace('file://', '')));

            return result;

        } catch (err: any) {
            console.error('❌ Capture error:', err);
            setCaptureError(err?.message || 'Gagal mengambil foto');
            setCapturedPhoto(null);
            return null;
        } finally {
            setIsCapturing(false);
        }
    }, []);

    /**
     * Clear capture result dan cleanup files
     */
    const clearCapture = useCallback(() => {
        if (capturedPhoto) {
            cleanupFiles(capturedPhoto.imagePath, capturedPhoto.originalPath);
        }
        originalPhotoRef.current = null;
        faceHistoryRef.current = [];
        setCapturedPhoto(null);
        setCaptureError(null);
        setDetectionStatus('📷 Arahkan wajah ke kamera');
    }, [capturedPhoto]);

    return {
        capturedPhoto,
        isCapturing,
        captureError,
        detectionStatus,
        capturePhoto,
        clearCapture,
    };
};

// ============ HELPER: UPLOAD TO SERVER ============

/**
 * Upload foto ke server API
 * 
 * @param photoPath - Path foto yang akan diupload
 * @param nip - NIP/ID Pegawai
 * @param apiUrl - URL endpoint API
 * @param token - Bearer token untuk authentication
 * @returns UploadResult dengan success status dan message
 */
export const uploadPhotoToServer = async (
    photoPath: string,
    nip: string,
    apiUrl: string,
    token: string
): Promise<UploadResult> => {
    try {
        console.log('📤 Mengupload foto ke server...');
        console.log('📁 Photo path:', photoPath);
        console.log('👤 NIP:', nip);
        console.log('🌐 API URL:', apiUrl);

        // Prepare file
        const cleanPath = photoPath.startsWith('file://') ? photoPath : 'file://' + photoPath;
        const filename = `absensi_${nip}_${Date.now()}.jpg`;
        
        const formData = new FormData();
        // @ts-ignore
        formData.append('photo', {
            uri: cleanPath,
            name: filename,
            type: 'image/jpeg',
        });
        formData.append('nip', nip);
        formData.append('timestamp', new Date().toISOString());

        // Upload via axios
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
            timeout: 30000, // 30 seconds timeout
        });

        console.log('✅ Upload berhasil:', response.data);

        return {
            success: true,
            message: 'Upload berhasil',
            data: response.data,
        };
    } catch (error: any) {
        console.error('❌ Upload failed:', error?.message);
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Upload gagal',
        };
    }
};

/**
 * Cleanup helper untuk hapus file foto
 */
export const cleanupPhoto = async (path: string): Promise<void> => {
    if (!path) return;
    try {
        const cleanPath = path.startsWith('file://') ? path.replace('file://', '') : path;
        if (await RNFS.exists(cleanPath)) {
            await RNFS.unlink(cleanPath);
            console.log('🗑️ File cleanup:', path);
        }
    } catch (e) {
        console.warn('⚠️ Cleanup failed:', e);
    }
};

export default usePassiveCapture;

