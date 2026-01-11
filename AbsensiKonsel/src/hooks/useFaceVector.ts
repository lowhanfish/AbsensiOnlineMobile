/**
 * ============================================
 * HOOK: useFaceVector
 * ============================================
 * Hook untuk ekstraksi vektor wajah menggunakan ML Kit
 * Menghasilkan vektor 128 dimensi dari landmarks & contours
 */

import { useState, useCallback } from 'react';

// Import ML Kit Face Detection
let FaceDetection: any = null;
try {
    FaceDetection = require('@react-native-ml-kit/face-detection').default;
} catch (e) {
    console.warn('⚠️ ML Kit tidak tersedia');
}

// ============ TYPES ============
export interface VectorData {
    embedding: number[];
    confidence: number;
    faceCount: number;
    timestamp: string;
    imagePath: string;
}

export interface UseFaceVectorReturn {
    vectorData: VectorData | null;
    isExtracting: boolean;
    extractError: string | null;
    extractVectorFromImage: (imagePath: string) => Promise<VectorData | null>;
    clearVector: () => void;
}

// ============ CONSTANTS ============
const VECTOR_DIMENSION = 128;

const LANDMARK_KEYS = [
    'leftEye', 'rightEye', 'leftEar', 'rightEar', 'noseBase',
    'leftCheek', 'rightCheek', 'leftMouth', 'rightMouth', 'bottomMouth'
];

const CONTOUR_KEYS = [
    'face', 'leftEyebrowTop', 'rightEyebrowTop',
    'noseBridge', 'upperLipTop', 'lowerLipBottom'
];

// ============ HOOK ============
export const useFaceVector = (): UseFaceVectorReturn => {
    const [vectorData, setVectorData] = useState<VectorData | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);

    /**
     * Ekstrak vektor dari gambar wajah
     */
    const extractVectorFromImage = useCallback(async (imagePath: string): Promise<VectorData | null> => {
        try {
            setIsExtracting(true);
            setExtractError(null);

            console.log('🧠 Memulai ekstraksi vektor dari:', imagePath);

            if (!FaceDetection || !FaceDetection.detect) {
                throw new Error('ML Kit tidak tersedia untuk ekstraksi vektor');
            }

            // Prepare path
            let detectionPath = imagePath;
            if (!detectionPath.startsWith('file://')) {
                detectionPath = 'file://' + detectionPath;
            }

            // Detect face dengan mode akurat
            const faces = await FaceDetection.detect(detectionPath, {
                performanceMode: 'accurate',
                landmarkMode: 'all',
                contourMode: 'all',
                classificationMode: 'all',
            });

            if (!faces || faces.length === 0) {
                throw new Error('Tidak ada wajah terdeteksi pada foto');
            }

            const face = faces[0];
            let extractedVector: number[] = [];

            // 1. Bounding box (4 nilai)
            extractedVector.push(
                face.bounds?.x || 0,
                face.bounds?.y || 0,
                face.bounds?.width || 0,
                face.bounds?.height || 0
            );

            // 2. Probabilitas (3 nilai)
            extractedVector.push(
                face.leftEyeOpenProbability || 0,
                face.rightEyeOpenProbability || 0,
                face.smilingProbability || 0
            );

            // 3. Head rotation (3 nilai)
            extractedVector.push(
                face.headEulerAngleX || 0,
                face.headEulerAngleY || 0,
                face.headEulerAngleZ || 0
            );

            // 4. Landmarks (20 nilai = 10 landmarks x 2 coordinates)
            if (face.landmarks && typeof face.landmarks === 'object') {
                for (const key of LANDMARK_KEYS) {
                    const landmark = face.landmarks[key];
                    if (landmark) {
                        extractedVector.push(landmark.x || 0, landmark.y || 0);
                    } else {
                        extractedVector.push(0, 0);
                    }
                }
            } else {
                // Pad with zeros if no landmarks
                for (let i = 0; i < LANDMARK_KEYS.length; i++) {
                    extractedVector.push(0, 0);
                }
            }

            // 5. Contours (12 nilai = 6 contours x 2 coordinates)
            if (face.contours && typeof face.contours === 'object') {
                for (const key of CONTOUR_KEYS) {
                    const contour = face.contours[key];
                    if (contour && Array.isArray(contour) && contour.length > 0) {
                        const point = contour[0];
                        extractedVector.push(point?.x || 0, point?.y || 0);
                    } else {
                        extractedVector.push(0, 0);
                    }
                }
            } else {
                // Pad with zeros if no contours
                for (let i = 0; i < CONTOUR_KEYS.length; i++) {
                    extractedVector.push(0, 0);
                }
            }

            // Pad/trim ke 128 dimensi
            while (extractedVector.length < VECTOR_DIMENSION) {
                extractedVector.push(0);
            }
            extractedVector = extractedVector.slice(0, VECTOR_DIMENSION);

            console.log(`✅ Vektor berhasil diekstrak: ${extractedVector.length} dimensi`);

            const newVectorData: VectorData = {
                embedding: extractedVector,
                confidence: 0.95,
                faceCount: faces.length,
                timestamp: new Date().toISOString(),
                imagePath: imagePath,
            };

            setVectorData(newVectorData);
            return newVectorData;

        } catch (err: any) {
            console.error('❌ Error extract vector:', err);
            const errorMsg = err.message || 'Gagal ekstrak vektor';
            setExtractError(errorMsg);
            setVectorData(null);
            return null;
        } finally {
            setIsExtracting(false);
        }
    }, []);

    /**
     * Clear vector data
     */
    const clearVector = useCallback(() => {
        setVectorData(null);
        setExtractError(null);
    }, []);

    return {
        vectorData,
        isExtracting,
        extractError,
        extractVectorFromImage,
        clearVector,
    };
};

export default useFaceVector;
