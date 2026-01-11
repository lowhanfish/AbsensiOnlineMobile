/**
 * ============================================
 * HOOK: useFaceVector
 * ============================================
 * Hook untuk ekstraksi vektor wajah menggunakan TFLite + MobileFaceNet
 * 
 * Prioritas:
 * 1. TFLite MobileFaceNet → 192 dimensi embedding UNIK per wajah
 * 2. Fallback ke ML Kit geometris features
 * 
 * UPDATED: Menggunakan useFaceEmbedding untuk TFLite inference
 */

import { useState, useCallback, useEffect } from 'react';
import { useFaceEmbedding } from './useFaceEmbedding';

// Import ML Kit Face Detection untuk fallback
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
    rawFaceData?: any;
}

export interface UseFaceVectorReturn {
    vectorData: VectorData | null;
    isExtracting: boolean;
    extractError: string | null;
    extractVectorFromImage: (imagePath: string) => Promise<VectorData | null>;
    clearVector: () => void;
}

// ============ CONSTANTS ============
const TARGET_DIMENSION = 192; // Match MobileFaceNet output

const LANDMARK_TYPES = [
    'LEFT_EYE', 'RIGHT_EYE', 'LEFT_EAR', 'RIGHT_EAR', 'NOSE_BASE',
    'LEFT_CHEEK', 'RIGHT_CHEEK', 'MOUTH_LEFT', 'MOUTH_RIGHT', 'MOUTH_BOTTOM',
];

const CONTOUR_TYPES = [
    'FACE', 'LEFT_EYEBROW_TOP', 'LEFT_EYEBROW_BOTTOM',
    'RIGHT_EYEBROW_TOP', 'RIGHT_EYEBROW_BOTTOM',
    'LEFT_EYE', 'RIGHT_EYE',
    'UPPER_LIP_TOP', 'UPPER_LIP_BOTTOM',
    'LOWER_LIP_TOP', 'LOWER_LIP_BOTTOM',
    'NOSE_BRIDGE', 'NOSE_BOTTOM',
];

// ============ HELPER FUNCTIONS ============
const normalizeCoord = (value: number, max: number): number => {
    if (!max || max === 0) return 0;
    return Math.min(Math.max(value / max, 0), 1);
};

const extractLandmarks = (face: any, imageWidth: number, imageHeight: number): number[] => {
    const landmarks: number[] = [];
    
    if (face.landmarks && typeof face.landmarks === 'object' && !Array.isArray(face.landmarks)) {
        for (const type of LANDMARK_TYPES) {
            const lm = face.landmarks[type] || face.landmarks[type.toLowerCase()];
            if (lm && typeof lm.x === 'number' && typeof lm.y === 'number') {
                landmarks.push(normalizeCoord(lm.x, imageWidth), normalizeCoord(lm.y, imageHeight));
            } else {
                landmarks.push(0, 0);
            }
        }
    } else if (Array.isArray(face.landmarks)) {
        for (const lm of face.landmarks.slice(0, LANDMARK_TYPES.length)) {
            if (lm && typeof lm.x === 'number') {
                landmarks.push(normalizeCoord(lm.x, imageWidth), normalizeCoord(lm.y, imageHeight));
            } else {
                landmarks.push(0, 0);
            }
        }
        while (landmarks.length < LANDMARK_TYPES.length * 2) landmarks.push(0);
    } else {
        for (let i = 0; i < LANDMARK_TYPES.length; i++) landmarks.push(0, 0);
    }
    
    return landmarks;
};

const extractContours = (face: any, imageWidth: number, imageHeight: number): number[] => {
    const contours: number[] = [];
    
    if (face.contours && typeof face.contours === 'object' && !Array.isArray(face.contours)) {
        for (const type of CONTOUR_TYPES) {
            const contour = face.contours[type] || face.contours[type.toLowerCase()];
            if (Array.isArray(contour) && contour.length > 0) {
                const midIdx = Math.floor(contour.length / 2);
                const point = contour[midIdx] || contour[0];
                if (point && typeof point.x === 'number') {
                    contours.push(normalizeCoord(point.x, imageWidth), normalizeCoord(point.y, imageHeight));
                } else {
                    contours.push(0, 0);
                }
            } else {
                contours.push(0, 0);
            }
        }
    } else {
        for (let i = 0; i < CONTOUR_TYPES.length; i++) contours.push(0, 0);
    }
    
    return contours;
};

// ============ HOOK ============
export const useFaceVector = (): UseFaceVectorReturn => {
    const [vectorData, setVectorData] = useState<VectorData | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);

    // Use TFLite face embedding hook
    const {
        embeddingData,
        isExtracting: isTFLiteExtracting,
        extractError: tfliteError,
        isModelLoaded,
        extractEmbeddingFromImage,
        clearEmbedding,
    } = useFaceEmbedding();

    /**
     * Ekstrak vektor dari gambar wajah
     * Prioritas: TFLite MobileFaceNet → Fallback ML Kit
     */
    const extractVectorFromImage = useCallback(async (imagePath: string): Promise<VectorData | null> => {
        try {
            setIsExtracting(true);
            setExtractError(null);

            console.log('🧠 [useFaceVector] Memulai ekstraksi vektor...');
            console.log('📁 Image path:', imagePath);
            console.log('🤖 TFLite model loaded:', isModelLoaded);

            // Try TFLite MobileFaceNet first
            console.log('🚀 Mencoba ekstraksi dengan TFLite MobileFaceNet...');
            const embeddingResult = await extractEmbeddingFromImage(imagePath);

            if (embeddingResult && embeddingResult.embedding.length > 0) {
                const nonZeroCount = embeddingResult.embedding.filter(v => Math.abs(v) > 0.001).length;
                console.log(`✅ Embedding berhasil: ${embeddingResult.embedding.length} dimensi, ${nonZeroCount} non-zero`);
                console.log('📊 Embedding sample:', embeddingResult.embedding.slice(0, 10));

                const newVectorData: VectorData = {
                    embedding: embeddingResult.embedding,
                    confidence: embeddingResult.confidence,
                    faceCount: 1,
                    timestamp: embeddingResult.timestamp,
                    imagePath: imagePath,
                    rawFaceData: { model: embeddingResult.modelUsed },
                };

                setVectorData(newVectorData);
                return newVectorData;
            }

            // Fallback to ML Kit based extraction
            console.log('⚠️ TFLite tidak tersedia, menggunakan ML Kit fallback...');
            return await extractWithMLKit(imagePath, setVectorData);

        } catch (err: any) {
            console.error('❌ Error extract vector:', err);
            const errorMsg = err.message || 'Gagal ekstrak vektor';
            setExtractError(errorMsg);
            setVectorData(null);
            return null;
        } finally {
            setIsExtracting(false);
        }
    }, [isModelLoaded, extractEmbeddingFromImage]);

    /**
     * Clear vector data
     */
    const clearVector = useCallback(() => {
        setVectorData(null);
        setExtractError(null);
        clearEmbedding();
    }, [clearEmbedding]);

    // Sync error state
    useEffect(() => {
        if (tfliteError) {
            console.log('⚠️ TFLite error:', tfliteError);
        }
    }, [tfliteError]);

    return {
        vectorData,
        isExtracting: isExtracting || isTFLiteExtracting,
        extractError,
        extractVectorFromImage,
        clearVector,
    };
};

/**
 * Fallback: Extract using ML Kit geometric features
 */
async function extractWithMLKit(
    imagePath: string,
    setVectorData: (data: VectorData) => void
): Promise<VectorData | null> {
    console.log('🔄 Extracting with ML Kit fallback...');

    if (!FaceDetection || !FaceDetection.detect) {
        throw new Error('ML Kit tidak tersedia untuk ekstraksi vektor');
    }

    let detectionPath = imagePath;
    if (!detectionPath.startsWith('file://')) {
        detectionPath = 'file://' + detectionPath;
    }

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

    const bounds = face.bounds || face.frame || face.boundingBox || {};
    const imageWidth = bounds.width || bounds.right - bounds.left || 1000;
    const imageHeight = bounds.height || bounds.bottom - bounds.top || 1000;

    // 1. Bounding box normalized (4 nilai)
    const boxX = bounds.x ?? bounds.left ?? 0;
    const boxY = bounds.y ?? bounds.top ?? 0;
    const boxW = bounds.width ?? (bounds.right != null && bounds.left != null ? bounds.right - bounds.left : 0);
    const boxH = bounds.height ?? (bounds.bottom != null && bounds.top != null ? bounds.bottom - bounds.top : 0);
    
    extractedVector.push(
        normalizeCoord(boxX, 1000),
        normalizeCoord(boxY, 1000),
        normalizeCoord(boxW, 1000),
        normalizeCoord(boxH, 1000)
    );

    // 2. Probabilitas (3 nilai)
    extractedVector.push(
        face.leftEyeOpenProbability ?? 0,
        face.rightEyeOpenProbability ?? 0,
        face.smilingProbability ?? 0
    );

    // 3. Head rotation normalized (3 nilai)
    extractedVector.push(
        ((face.headEulerAngleX ?? 0) + 180) / 360,
        ((face.headEulerAngleY ?? 0) + 180) / 360,
        ((face.headEulerAngleZ ?? 0) + 180) / 360
    );

    // 4. Landmarks (20 nilai)
    const landmarkValues = extractLandmarks(face, imageWidth, imageHeight);
    extractedVector.push(...landmarkValues);

    // 5. Contours (26 nilai)
    const contourValues = extractContours(face, imageWidth, imageHeight);
    extractedVector.push(...contourValues);

    // 6. Derived features
    const faceRatio = boxH > 0 ? boxW / boxH : 0;
    extractedVector.push(faceRatio);

    if (landmarkValues[0] !== 0 && landmarkValues[2] !== 0) {
        const eyeDistance = Math.sqrt(
            Math.pow(landmarkValues[2] - landmarkValues[0], 2) +
            Math.pow(landmarkValues[3] - landmarkValues[1], 2)
        );
        extractedVector.push(eyeDistance);
    } else {
        extractedVector.push(0);
    }

    // Pad/trim ke TARGET_DIMENSION
    while (extractedVector.length < TARGET_DIMENSION) {
        extractedVector.push(0);
    }
    extractedVector = extractedVector.slice(0, TARGET_DIMENSION);

    const nonZeroCount = extractedVector.filter(v => v !== 0).length;
    console.log(`✅ ML Kit vektor: ${extractedVector.length} dimensi, ${nonZeroCount} non-zero`);

    const newVectorData: VectorData = {
        embedding: extractedVector,
        confidence: nonZeroCount / TARGET_DIMENSION,
        faceCount: faces.length,
        timestamp: new Date().toISOString(),
        imagePath: imagePath,
        rawFaceData: face,
    };

    setVectorData(newVectorData);
    return newVectorData;
}

export default useFaceVector;
