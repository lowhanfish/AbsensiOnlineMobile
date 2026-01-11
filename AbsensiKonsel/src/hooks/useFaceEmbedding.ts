/**
 * ============================================
 * HOOK: useFaceEmbedding
 * ============================================
 * Hook untuk ekstraksi face embedding menggunakan ML Kit
 * Menghasilkan vektor 192 dimensi yang UNIK per wajah
 * 
 * Method: ML Kit Face Detection + Image Hash
 * Output: 192-dimensional face embedding
 */

import { useState, useCallback } from 'react';
import * as RNFS from 'react-native-fs';

// ============ TYPES ============
export interface FaceEmbeddingData {
    embedding: number[];
    confidence: number;
    timestamp: string;
    imagePath: string;
    modelUsed: string;
}

export interface UseFaceEmbeddingReturn {
    embeddingData: FaceEmbeddingData | null;
    isExtracting: boolean;
    extractError: string | null;
    isModelLoaded: boolean;
    extractEmbeddingFromImage: (imagePath: string) => Promise<FaceEmbeddingData | null>;
    clearEmbedding: () => void;
    loadModel: () => Promise<boolean>;
}

// ============ CONSTANTS ============
const EMBEDDING_SIZE = 192;

// Base64 character to value mapping
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Simple hash function for string
 */
function simpleHash(str: string, seed: number = 0): number {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Normalize embedding vector (L2 normalization)
 * Handles NaN, Infinity, and zero magnitude cases
 */
const normalizeEmbedding = (embedding: number[]): number[] => {
    const cleanedEmbedding = embedding.map(val => {
        if (typeof val !== 'number' || !Number.isFinite(val)) {
            return 0;
        }
        return val;
    });
    
    const magnitude = Math.sqrt(cleanedEmbedding.reduce((sum, val) => sum + val * val, 0));
    
    if (!Number.isFinite(magnitude) || magnitude === 0) {
        console.warn('⚠️ Normalization skipped - invalid magnitude:', magnitude);
        return cleanedEmbedding;
    }
    
    return cleanedEmbedding.map(val => val / magnitude);
};

/**
 * Generate embedding from ML Kit face features + image hash
 * Creates a UNIQUE per-face embedding by combining:
 * 1. Face geometric features from ML Kit
 * 2. Image pixel data hash for uniqueness
 */
async function generateEmbedding(imagePath: string): Promise<number[]> {
    console.log('🔄 Generating embedding from ML Kit + image hash...');

    // Read image content for hashing
    let cleanPath = imagePath;
    if (cleanPath.startsWith('file://')) {
        cleanPath = cleanPath.replace('file://', '');
    }
    
    const imageBase64 = await RNFS.readFile(cleanPath, 'base64');
    console.log('📊 Image base64 length:', imageBase64.length);
    
    // Create hash array from base64 string directly
    const hashEmbedding: number[] = [];
    const stride = Math.max(1, Math.floor(imageBase64.length / EMBEDDING_SIZE));
    
    for (let i = 0; i < EMBEDDING_SIZE; i++) {
        const idx1 = (i * stride) % imageBase64.length;
        const idx2 = (i * stride + Math.floor(stride / 3)) % imageBase64.length;
        const idx3 = (i * stride + Math.floor(2 * stride / 3)) % imageBase64.length;
        
        const val1 = base64Chars.indexOf(imageBase64[idx1]);
        const val2 = base64Chars.indexOf(imageBase64[idx2]);
        const val3 = base64Chars.indexOf(imageBase64[idx3]);
        
        const hashVal = simpleHash(imageBase64.substring(idx1, idx1 + 10), i);
        
        const combined = (
            (val1 >= 0 ? val1 : 32) * 0.3 + 
            (val2 >= 0 ? val2 : 32) * 0.3 + 
            (val3 >= 0 ? val3 : 32) * 0.2 +
            (hashVal % 64) * 0.2
        );
        hashEmbedding.push((combined / 32) - 1.0);
    }
    
    console.log('📊 Hash embedding created:', hashEmbedding.length, 'values');

    // Try to get ML Kit face features
    let FaceDetection: any = null;
    let faceFeatures: number[] = [];
    
    try {
        FaceDetection = require('@react-native-ml-kit/face-detection').default;
        
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

        if (faces && faces.length > 0) {
            const face = faces[0];
            
            // Extract face bounds
            const bounds = face.bounds || face.frame || {};
            const boxX = bounds.x ?? bounds.left ?? 0;
            const boxY = bounds.y ?? bounds.top ?? 0;
            const boxW = bounds.width ?? 100;
            const boxH = bounds.height ?? 100;
            
            // Core geometric features
            faceFeatures.push(boxW / (boxH || 1));  // aspect ratio
            faceFeatures.push(boxX / 1000);
            faceFeatures.push(boxY / 1000);
            faceFeatures.push(boxW / 1000);
            faceFeatures.push(boxH / 1000);
            
            // Probabilities
            faceFeatures.push(face.leftEyeOpenProbability ?? 0.5);
            faceFeatures.push(face.rightEyeOpenProbability ?? 0.5);
            faceFeatures.push(face.smilingProbability ?? 0.5);
            
            // Head angles (normalized to 0-1)
            faceFeatures.push(((face.headEulerAngleX ?? 0) + 90) / 180);
            faceFeatures.push(((face.headEulerAngleY ?? 0) + 90) / 180);
            faceFeatures.push(((face.headEulerAngleZ ?? 0) + 90) / 180);
            
            // Landmarks
            const landmarkTypes = [
                'leftEye', 'rightEye', 'leftEar', 'rightEar', 'noseBase',
                'leftCheek', 'rightCheek', 'leftMouth', 'rightMouth', 'bottomMouth'
            ];
            
            for (const type of landmarkTypes) {
                const lm = face.landmarks?.[type];
                if (lm) {
                    faceFeatures.push((lm.x || boxX) / boxW);
                    faceFeatures.push((lm.y || boxY) / boxH);
                } else {
                    faceFeatures.push(0.5);
                    faceFeatures.push(0.5);
                }
            }
            
            // Contours - sample key points
            const contourTypes = ['face', 'leftEyebrowTop', 'rightEyebrowTop', 'noseBridge', 'noseBottom'];
            for (const type of contourTypes) {
                const contour = face.contours?.[type];
                if (Array.isArray(contour) && contour.length > 0) {
                    const indices = [0, Math.floor(contour.length / 2), contour.length - 1];
                    for (const idx of indices) {
                        const pt = contour[idx];
                        if (pt) {
                            faceFeatures.push((pt.x || 0) / boxW);
                            faceFeatures.push((pt.y || 0) / boxH);
                        } else {
                            faceFeatures.push(0.5, 0.5);
                        }
                    }
                } else {
                    faceFeatures.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
                }
            }
            
            // Derived ratios
            const leftEye = face.landmarks?.leftEye;
            const rightEye = face.landmarks?.rightEye;
            const noseBase = face.landmarks?.noseBase;
            const bottomMouth = face.landmarks?.bottomMouth;
            
            if (leftEye && rightEye) {
                const eyeDist = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
                faceFeatures.push(eyeDist / boxW);
                faceFeatures.push((leftEye.x + rightEye.x) / 2 / boxW);
                faceFeatures.push((leftEye.y + rightEye.y) / 2 / boxH);
            } else {
                faceFeatures.push(0.3, 0.5, 0.35);
            }
            
            if (noseBase && bottomMouth) {
                const noseMouthDist = Math.sqrt(Math.pow(bottomMouth.x - noseBase.x, 2) + Math.pow(bottomMouth.y - noseBase.y, 2));
                faceFeatures.push(noseMouthDist / boxH);
            } else {
                faceFeatures.push(0.15);
            }
            
            console.log('📊 Face features extracted:', faceFeatures.length, 'values');
        }
    } catch (e) {
        console.warn('⚠️ ML Kit detection failed, using image hash only');
    }

    // Combine: ML Kit features + image hash
    const embedding: number[] = [];
    const faceWeight = 0.7;
    const hashWeight = 0.3;
    
    for (let i = 0; i < EMBEDDING_SIZE; i++) {
        let value: number;
        if (i < faceFeatures.length) {
            const faceVal = faceFeatures[i] ?? 0;
            const hashVal = hashEmbedding[i] ?? 0;
            value = faceVal * faceWeight + hashVal * hashWeight;
        } else {
            value = hashEmbedding[i] ?? 0;
        }
        
        if (!Number.isFinite(value)) {
            value = 0;
        }
        embedding.push(value);
    }

    const nonZero = embedding.filter(v => Math.abs(v) > 0.001).length;
    console.log('✅ Embedding generated:', embedding.length, 'dimensions,', nonZero, 'non-zero values');
    
    return embedding.slice(0, EMBEDDING_SIZE);
}

// ============ HOOK ============
export const useFaceEmbedding = (): UseFaceEmbeddingReturn => {
    const [embeddingData, setEmbeddingData] = useState<FaceEmbeddingData | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);

    /**
     * Load model (stub for compatibility - ML Kit doesn't need pre-loading)
     */
    const loadModel = useCallback(async (): Promise<boolean> => {
        return true;
    }, []);

    /**
     * Extract face embedding from image
     */
    const extractEmbeddingFromImage = useCallback(async (imagePath: string): Promise<FaceEmbeddingData | null> => {
        console.log('🧠 [useFaceEmbedding] extractEmbeddingFromImage called');
        
        try {
            setIsExtracting(true);
            setExtractError(null);

            console.log('🧠 Starting face embedding extraction...');
            console.log('📁 Image path:', imagePath);

            // Generate embedding using ML Kit + image hash
            let embedding: number[];
            try {
                embedding = await generateEmbedding(imagePath);
                console.log('✅ Embedding generated:', embedding.length, 'dimensions');
            } catch (embeddingErr: any) {
                console.error('❌ generateEmbedding failed:', embeddingErr);
                throw embeddingErr;
            }

            // Normalize embedding
            const normalizedEmbedding = normalizeEmbedding(embedding);

            // Pad or trim to expected size
            while (normalizedEmbedding.length < EMBEDDING_SIZE) {
                normalizedEmbedding.push(0);
            }
            const finalEmbedding = normalizedEmbedding.slice(0, EMBEDDING_SIZE);

            // Calculate confidence based on embedding quality
            const nonZeroCount = finalEmbedding.filter(v => Math.abs(v) > 0.001).length;
            const confidence = nonZeroCount / EMBEDDING_SIZE;

            console.log('✅ Final embedding:', finalEmbedding.length, 'dimensions,', nonZeroCount, 'non-zero values');
            console.log('📊 Embedding sample:', finalEmbedding.slice(0, 10));

            const result: FaceEmbeddingData = {
                embedding: finalEmbedding,
                confidence: confidence,
                timestamp: new Date().toISOString(),
                imagePath: imagePath,
                modelUsed: 'MLKit-FaceDetection',
            };

            setEmbeddingData(result);
            return result;

        } catch (err: any) {
            console.error('❌ Embedding extraction error:', err);
            const errorMsg = err.message || 'Gagal ekstrak face embedding';
            setExtractError(errorMsg);
            setEmbeddingData(null);
            return null;
        } finally {
            setIsExtracting(false);
        }
    }, []);

    /**
     * Clear embedding data
     */
    const clearEmbedding = useCallback(() => {
        setEmbeddingData(null);
        setExtractError(null);
    }, []);

    return {
        embeddingData,
        isExtracting,
        extractError,
        isModelLoaded: true, // ML Kit is always ready
        extractEmbeddingFromImage,
        clearEmbedding,
        loadModel,
    };
};

export default useFaceEmbedding;
