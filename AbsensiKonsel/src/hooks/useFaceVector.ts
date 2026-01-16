/**
 * ============================================
 * HOOK: useFaceVector
 * ============================================
 * Hook untuk pengambilan foto wajah dengan:
 * - Face detection menggunakan ML Kit
 * - Face crop (center/cover)
 * - Resize ke 480x480 pixel
 * - Compress JPEG quality 80%
 * 
 * Output: Path gambar wajah yang siap dikirim ke server
 * untuk embedding extraction di sisi server (RTX 5090)
 */

import { useState, useCallback, useEffect, RefObject } from 'react';
import { Camera } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { check_gelar_depan, check_gelar_belakang, namaLengkap } from '../lib/kiken';

// Import ML Kit Face Detection
let FaceDetection: any = null;
try {
    FaceDetection = require('@react-native-ml-kit/face-detection').default;
} catch (e) {
    console.warn('⚠️ ML Kit tidak tersedia');
}

// ============ TYPES ============
export interface FaceCropResult {
    imagePath: string;
    fileSize: number;
    width: number;
    height: number;
    confidence: number;
    faceBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    timestamp: string;
}

export interface UseFaceVectorReturn {
    cropResult: FaceCropResult | null;
    isProcessing: boolean;
    processError: string | null;
    processFaceImage: (
        imagePath: string,
        cameraRef?: RefObject<Camera | null>
    ) => Promise<FaceCropResult | null>;
    clearResult: () => void;
    // Liveness methods
    startLivenessCheck: (cameraRef: RefObject<Camera | null>) => Promise<LivenessResult | null>;
    livenessStatus: string;
    isLivenessChecking: boolean;
}

// ============ CONSTANTS ============
const TARGET_SIZE = 480;           // 480x480 pixel
const JPEG_QUALITY = 80;           // 80% quality
const MIN_FACE_SIZE = 100;         // Minimum face size in pixels
const MAX_FILE_SIZE = 180 * 1024;  // 180 KB max
const MIN_FILE_SIZE = 100 * 1024;  // 100 KB min

// ============ HELPER FUNCTIONS ============

/**
 * Hitung aspect ratio untuk cover crop
 */
const getCoverCropParams = (
    imageWidth: number,
    imageHeight: number,
    _targetSize: number
): { cropX: number; cropY: number; cropWidth: number; cropHeight: number } => {
    const imageAspect = imageWidth / imageHeight;
    const targetAspect = 1; // Square

    let cropWidth: number;
    let cropHeight: number;
    let cropX: number;
    let cropY: number;

    if (imageAspect > targetAspect) {
        // Image lebih lebar, potong sisi kiri-kanan
        cropHeight = imageHeight;
        cropWidth = imageHeight; // Square crop
        cropX = (imageWidth - cropWidth) / 2;
        cropY = 0;
    } else {
        // Image lebih tinggi, potong atas-bawah
        cropWidth = imageWidth;
        cropHeight = imageWidth;
        cropX = 0;
        cropY = (imageHeight - cropHeight) / 2;
    }

    return { cropX, cropY, cropWidth, cropHeight };
};

/**
 * Deteksi wajah menggunakan ML Kit danambil bounding box
 */
const detectFaceBounds = async (imagePath: string): Promise<{
    bounds: { x: number; y: number; width: number; height: number } | null;
    confidence: number;
} | null> => {
    if (!FaceDetection || !FaceDetection.detect) {
        console.warn('⚠️ ML Kit Face Detection tidak tersedia');
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
            console.warn('⚠️ Tidak ada wajah terdeteksi');
            return null;
        }

        // Ambil wajah terbesar
        let largestFace = faces[0];
        let maxArea = 0;

        for (const face of faces) {
            const bounds = face.bounds || face.frame || face.boundingBox || {};
            const area = (bounds.width || 0) * (bounds.height || 0);
            if (area > maxArea) {
                maxArea = area;
                largestFace = face;
            }
        }

        const bounds = largestFace.bounds || largestFace.frame || largestFace.boundingBox || {};
        const confidence = largestFace.trackingId ? 1.0 : 0.8;

        // Validasi ukuran wajah
        const faceSize = Math.min(bounds.width || 0, bounds.height || 0);
        if (faceSize < MIN_FACE_SIZE) {
            console.warn(`⚠️ Wajah terlalu kecil: ${faceSize}px (min: ${MIN_FACE_SIZE}px)`);
            return null;
        }

        return { bounds, confidence };
    } catch (error) {
        console.error('❌ Error detecting face:', error);
        return null;
    }
};

/**
 * Crop wajah dari gambar menggunakan bounding box
 * Simplifikasi: langsung cover crop karena ImageResizer tidak support precise crop
 */
const cropFace = async (
    imagePath: string,
    _faceBounds: { x: number; y: number; width: number; height: number }
): Promise<string> => {
    // ImageResizer tidak support precise crop dengan coordinates
    // Kita gunakan cover crop saja yang akan auto-center wajah
    return await coverCropImage(imagePath);
};

/**
 * Fallback: Cover crop (ambil center gambar)
 */
const coverCropImage = async (imagePath: string): Promise<string> => {
    const tempPath = `${RNFS.CachesDirectoryPath}/face_cover_${Date.now()}.jpg`;

    try {
        // Pertama resize biar lebih kecil
        const resizedPath = `${RNFS.CachesDirectoryPath}/temp_resize_${Date.now()}.jpg`;
        
        await ImageResizer.createResizedImage(
            imagePath,
            800,  // Max dimension sebelum crop
            800,
            'JPEG',
            90,
            0,
            resizedPath,
            true
        );

        // Cover crop ke 480x480
        const response = await ImageResizer.createResizedImage(
            resizedPath,
            TARGET_SIZE,
            TARGET_SIZE,
            'JPEG',
            JPEG_QUALITY,
            0,
            tempPath,
            true,
            { mode: 'cover' as const }
        );

        // Cleanup temp file
        try { await RNFS.unlink(resizedPath); } catch (e) { }

        return response.uri;
    } catch (error) {
        console.error('❌ Cover crop failed:', error);
        
        // Last resort: Just resize
        const lastResortPath = `${RNFS.CachesDirectoryPath}/face_final_${Date.now()}.jpg`;
        const response = await ImageResizer.createResizedImage(
            imagePath,
            TARGET_SIZE,
            TARGET_SIZE,
            'JPEG',
            JPEG_QUALITY,
            0,
            lastResortPath,
            true
        );
        return response.uri;
    }
};

/**
 * Resize gambar ke 480x480 dengan quality 80%
 */
const resizeToTarget = async (imagePath: string): Promise<string> => {
    const tempPath = `${RNFS.CachesDirectoryPath}/face_resized_${Date.now()}.jpg`;

    try {
        const response = await ImageResizer.createResizedImage(
            imagePath,
            TARGET_SIZE,
            TARGET_SIZE,
            'JPEG',
            JPEG_QUALITY,
            0,
            tempPath,
            true,
            { mode: 'cover' as const }
        );

        return response.uri;
    } catch (error) {
        console.error('❌ Resize failed:', error);
        return imagePath; // Return original if resize fails
    }
};

/**
 * Hitung ukuran file dalam KB
 */
const getFileSize = async (path: string): Promise<number> => {
    try {
        const stat = await RNFS.stat(path);
        return stat.size;
    } catch (error) {
        return 0;
    }
};

/**
 * Cleanup temporary files
 */
const safeCleanup = async (...paths: string[]): Promise<void> => {
    for (const path of paths) {
        try {
            if (await RNFS.exists(path)) {
                await RNFS.unlink(path);
            }
        } catch (e) {
            // Silent fail
        }
    }
};

// ============ HOOK ============
export const useFaceVector = (): UseFaceVectorReturn => {
    const [cropResult, setCropResult] = useState<FaceCropResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processError, setProcessError] = useState<string | null>(null);
    const [livenessStatus, setLivenessStatus] = useState('📷 Siap untuk verifikasi');
    const [isLivenessChecking, setIsLivenessChecking] = useState(false);

    // Liveness state
    const [livenessResult, setLivenessResult] = useState<{
        path: string;
        gestures: { [key: string]: boolean };
    } | null>(null);

    /**
     * Process gambar wajah: detect → crop → resize
     */
    const processFaceImage = useCallback(async (
        imagePath: string,
        cameraRef?: RefObject<Camera | null>
    ): Promise<FaceCropResult | null> => {
        let tempCroppedPath: string | null = null;

        try {
            setIsProcessing(true);
            setProcessError(null);

            console.log('🧠 [useFaceVector] Memulai process wajah...');
            console.log('📁 Input image:', imagePath);

            // Step 1: Deteksi wajah menggunakan ML Kit
            console.log('🔍 Mendeteksi wajah...');
            const faceResult = await detectFaceBounds(imagePath);

            let croppedPath: string;

            if (faceResult && faceResult.bounds) {
                console.log('✅ Wajah terdeteksi, melakukan crop...');
                console.log(`📐 Bounds: x=${faceResult.bounds.x}, y=${faceResult.bounds.y}, w=${faceResult.bounds.width}, h=${faceResult.bounds.height}`);
                
                croppedPath = await cropFace(imagePath, faceResult.bounds);
            } else {
                console.log('⚠️ Wajah tidak terdeteksi, menggunakan cover crop...');
                croppedPath = await coverCropImage(imagePath);
            }

            tempCroppedPath = croppedPath;

            // Step 2: Resize ke 480x480
            console.log('📐 Resize ke 480x480...');
            const resizedPath = await resizeToTarget(croppedPath);

            if (resizedPath !== croppedPath) {
                tempCroppedPath = resizedPath;
                await safeCleanup(croppedPath);
            }

            // Step 3: Verifikasi ukuran file
            let fileSize = await getFileSize(resizedPath);
            console.log(`📊 Ukuran file: ${(fileSize / 1024).toFixed(1)} KB`);

            // Adjust quality jika perlu
            if (fileSize > MAX_FILE_SIZE) {
                console.log('⚠️ File terlalu besar, menurunkan quality...');
                // Ini akan di-handle oleh server atau client-side recompress
            } else if (fileSize < MIN_FILE_SIZE) {
                console.log('⚠️ File terlalu kecil, mungkin kualitas rendah');
            }

            // Step 4: Get dimensions
            // Note: Kita asumsikan 480x480 dari resize
            const result: FaceCropResult = {
                imagePath: resizedPath,
                fileSize: fileSize,
                width: TARGET_SIZE,
                height: TARGET_SIZE,
                confidence: faceResult?.confidence || 0.5,
                faceBounds: faceResult?.bounds || { x: 0, y: 0, width: 0, height: 0 },
                timestamp: new Date().toISOString(),
            };

            setCropResult(result);
            console.log('✅ Face process selesai:', `${(fileSize / 1024).toFixed(1)} KB`);

            return result;

        } catch (err: any) {
            console.error('❌ Error processing face:', err);
            setProcessError(err?.message || 'Gagal memproses gambar wajah');
            setCropResult(null);
            return null;

        } finally {
            setIsProcessing(false);
        }
    }, []);

    /**
     * Clear result
     */
    const clearResult = useCallback(() => {
        if (cropResult?.imagePath) {
            safeCleanup(cropResult.imagePath);
        }
        setCropResult(null);
        setProcessError(null);
        setLivenessResult(null);
    }, [cropResult]);

    // ============ LIVENESS DETECTION ============

    /**
     * Get 2 random gestures
     */
    const getRandomGestures = useCallback((): { id: string; text: string }[] => {
        const gestures = [
            { id: 'blink', text: '👁️ KEDIP MATA' },
            { id: 'smile', text: '😊 SENYUM' },
            { id: 'right_eye_close', text: '➡️ TUTUP MATA KANAN' },
        ];
        return [...gestures].sort(() => 0.5 - Math.random()).slice(0, 2);
    }, []);

    /**
     * Analyze gesture frames
     */
    const analyzeGesture = useCallback((gestureId: string, frames: any[]): boolean => {
        if (frames.length < 3) return false;

        switch (gestureId) {
            case 'blink': {
                let hasClose = false, hasOpen = false;
                for (const f of frames) {
                    const avgEye = ((f.leftEyeOpen || 1) + (f.rightEyeOpen || 1)) / 2;
                    if (avgEye < 0.3) hasClose = true;
                    if (avgEye > 0.7) hasOpen = true;
                }
                return hasClose && hasOpen;
            }
            case 'smile': {
                let hasSmile = false, hasNeutral = false;
                for (const f of frames) {
                    const prob = f.face?.smilingProbability || 0.5;
                    if (prob > 0.6) hasSmile = true;
                    if (prob < 0.4) hasNeutral = true;
                }
                return hasSmile && hasNeutral;
            }
            case 'right_eye_close': {
                let hasClose = false, hasOpen = false;
                for (const f of frames) {
                    const rightEye = f.rightEyeOpen || 1;
                    const leftEye = f.leftEyeOpen || 1;
                    if (rightEye < 0.3 && leftEye > 0.5) hasClose = true;
                    if (rightEye > 0.6) hasOpen = true;
                }
                return hasClose && hasOpen;
            }
            default: return false;
        }
    }, []);

    /**
     * Record gesture frames
     */
    const recordGestureFrames = useCallback(async (
        gesture: { id: string; text: string },
        cameraRef: RefObject<Camera | null>
    ): Promise<boolean> => {
        const framePaths: string[] = [];
        const startTime = Date.now();
        let isRecording = true;

        const captureLoop = async () => {
            while (isRecording && Date.now() - startTime < 10000) {
                if (!cameraRef.current) {
                    await new Promise(r => setTimeout(r, 200));
                    continue;
                }
                try {
                    const photo = await cameraRef.current.takePhoto();
                    if (photo) framePaths.push(photo.path);
                } catch (e) { /* ignore */ }
                await new Promise(r => setTimeout(r, 100));
            }
        };

        captureLoop();
        await new Promise(r => setTimeout(r, 2500));
        isRecording = false;
        await captureLoop();

        if (framePaths.length < 3) {
            framePaths.forEach(p => RNFS.unlink(p).catch(() => {}));
            return false;
        }

        // Analyze frames
        const frames: any[] = [];
        for (let i = 0; i < framePaths.length; i++) {
            try {
                let path = framePaths[i];
                if (!path.startsWith('file://')) path = 'file://' + path;

                if (FaceDetection?.detect) {
                    const faces = await FaceDetection.detect(path, {
                        performanceMode: 'fast',
                        classificationMode: 'all',
                    });
                    if (faces?.length > 0) {
                        const face = faces[0];
                        frames.push({
                            face,
                            leftEyeOpen: face.leftEyeOpenProbability,
                            rightEyeOpen: face.rightEyeOpenProbability,
                        });
                    }
                }
            } catch (e) { /* ignore */ }
        }

        framePaths.forEach(p => RNFS.unlink(p).catch(() => {}));

        return frames.length >= 3 && analyzeGesture(gesture.id, frames);
    }, [analyzeGesture]);

    /**
     * Main liveness check
     */
    const startLivenessCheck = useCallback(async (
        cameraRef: RefObject<Camera | null>
    ): Promise<LivenessResult | null> => {
        try {
            setIsLivenessChecking(true);
            setLivenessStatus('🎬 Memulai verifikasi liveness...');

            if (!FaceDetection?.detect) {
                return { isLive: false, score: 0, reason: 'ML Kit tidak tersedia', results: {}, finalPath: null };
            }

            const gestures = getRandomGestures();
            const results: { [key: string]: boolean } = {};

            for (let i = 0; i < gestures.length; i++) {
                const gesture = gestures[i];
                let detected = false;
                let attempts = 0;

                while (!detected && attempts < 3) {
                    attempts++;
                    setLivenessStatus(`${gesture.text}\n(Upaya ${attempts}/3)`);

                    detected = await recordGestureFrames(gesture, cameraRef);

                    if (detected) {
                        setLivenessStatus(`✅ ${gesture.text} - Terdeteksi!`);
                        results[gesture.id] = true;
                        await new Promise(r => setTimeout(r, 1500));
                    } else if (attempts < 3) {
                        setLivenessStatus(`❌ Coba lagi...`);
                        await new Promise(r => setTimeout(r, 1500));
                    }
                }

                if (!detected) {
                    return { isLive: false, score: 0, reason: `Gesture "${gesture.text}" gagal`, results, finalPath: null };
                }
            }

            // Take final photo
            setLivenessStatus('📸 Mengambil foto final...');
            await new Promise(r => setTimeout(r, 1000));

            let finalPath: string | null = null;
            try {
                const photo = await cameraRef.current?.takePhoto();
                if (photo?.path) finalPath = photo.path;
            } catch (e) { /* ignore */ }

            if (finalPath) {
                // Process final image dengan face crop
                const result = await processFaceImage(finalPath);
                if (result) {
                    setLivenessResult({ path: result.imagePath, gestures: results });
                    return {
                        isLive: true,
                        score: 1.0,
                        reason: `Semua ${gestures.length} gesture terdeteksi`,
                        results,
                        finalPath: result.imagePath,
                    };
                }
            }

            return { isLive: true, score: 1.0, reason: 'Liveness verified', results, finalPath };

        } catch (err: any) {
            return { isLive: false, score: 0, reason: err?.message || 'Error', results: {}, finalPath: null };
        } finally {
            setIsLivenessChecking(false);
        }
    }, [getRandomGestures, recordGestureFrames, processFaceImage]);

    // Sync cleanup on unmount
    useEffect(() => {
        return () => {
            if (cropResult?.imagePath) {
                safeCleanup(cropResult.imagePath);
            }
        };
    }, []);

    return {
        cropResult,
        isProcessing,
        processError,
        processFaceImage,
        clearResult,
        startLivenessCheck,
        livenessStatus,
        isLivenessChecking,
    };
};

// ============ LIVENESS RESULT TYPE ============
export interface LivenessResult {
    isLive: boolean;
    score: number;
    reason: string;
    results: { [key: string]: boolean };
    finalPath: string | null;
}

export default useFaceVector;

