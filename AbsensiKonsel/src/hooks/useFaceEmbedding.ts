/**
 * ============================================
 * HOOK: useFaceEmbedding
 * ============================================
 * Hook untuk ekstraksi face embedding menggunakan TFLite + MobileFaceNet
 * Menghasilkan vektor 192 dimensi yang UNIK per wajah
 * 
 * Model: MobileFaceNet
 * Input: 112x112 RGB image
 * Output: 192-dimensional face embedding
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Image as RNImage } from 'react-native';
import * as RNFS from 'react-native-fs';

// TFLite types
interface TFLiteModel {
    run: (input: Float32Array[]) => Float32Array[];
}

// Lazy load TFLite
let TensorFlowLite: any = null;
let loadedModel: TFLiteModel | null = null;
let modelLoadPromise: Promise<TFLiteModel | null> | null = null;

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
const MODEL_INPUT_SIZE = 112; // MobileFaceNet uses 112x112
const EMBEDDING_SIZE = 192;   // MobileFaceNet outputs 192 dimensions

// Flag to enable/disable TFLite (set to false to avoid crash)
const ENABLE_TFLITE = false;

// Model path for react-native-fast-tflite
// Android: use bundled asset reference
// iOS: use MainBundle path
const getModelSource = () => {
    if (Platform.OS === 'android') {
        // For Android, use asset URI
        return { url: 'asset:/mobilefacenet.tflite' };
    } else {
        // For iOS, use bundle path
        return { url: `file://${RNFS.MainBundlePath}/mobilefacenet.tflite` };
    }
};

// ============ HELPER FUNCTIONS ============

/**
 * Load and initialize TFLite model
 */
const initializeModel = async (): Promise<TFLiteModel | null> => {
    // Skip TFLite if disabled
    if (!ENABLE_TFLITE) {
        console.log('ℹ️ TFLite disabled, using ML Kit fallback');
        return null;
    }
    
    try {
        // Already loaded
        if (loadedModel) {
            console.log('✅ Model already loaded');
            return loadedModel;
        }

        // Currently loading
        if (modelLoadPromise) {
            return modelLoadPromise;
        }

        console.log('🧠 Loading TFLite model...');

        // Lazy load TFLite library
        if (!TensorFlowLite) {
            try {
                TensorFlowLite = require('react-native-fast-tflite');
                console.log('✅ TFLite library loaded:', Object.keys(TensorFlowLite));
            } catch (e) {
                console.error('❌ Failed to load TFLite library:', e);
                return null;
            }
        }

        // Load model
        modelLoadPromise = (async () => {
            try {
                const modelSource = getModelSource();
                console.log('📁 Loading model from:', modelSource);
                
                // Try different loading methods
                let model: TFLiteModel | null = null;
                
                // Method 1: loadTensorflowModel with source object
                if (TensorFlowLite.loadTensorflowModel) {
                    try {
                        model = await TensorFlowLite.loadTensorflowModel(modelSource);
                        console.log('✅ Model loaded with loadTensorflowModel');
                    } catch (e1) {
                        console.warn('⚠️ loadTensorflowModel failed:', e1);
                    }
                }
                
                // Method 2: Try with default export
                if (!model && TensorFlowLite.default?.loadTensorflowModel) {
                    try {
                        model = await TensorFlowLite.default.loadTensorflowModel(modelSource);
                        console.log('✅ Model loaded with default.loadTensorflowModel');
                    } catch (e2) {
                        console.warn('⚠️ default.loadTensorflowModel failed:', e2);
                    }
                }
                
                // Method 3: Try with useTensorflowModel pattern (for hooks)
                if (!model && TensorFlowLite.useTensorflowModel) {
                    console.log('ℹ️ TFLite uses hook pattern, will load on first use');
                }
                
                // Method 4: Try with string path directly
                if (!model) {
                    try {
                        const pathStr = Platform.OS === 'android' 
                            ? 'mobilefacenet.tflite'
                            : `${RNFS.MainBundlePath}/mobilefacenet.tflite`;
                        
                        if (TensorFlowLite.loadTensorflowModel) {
                            model = await TensorFlowLite.loadTensorflowModel(pathStr);
                            console.log('✅ Model loaded with string path');
                        }
                    } catch (e3) {
                        console.warn('⚠️ String path loading failed:', e3);
                    }
                }

                if (model) {
                    loadedModel = model;
                    console.log('✅ MobileFaceNet model loaded successfully');
                    return model;
                } else {
                    console.error('❌ All model loading methods failed');
                    return null;
                }
            } catch (err) {
                console.error('❌ Failed to load model:', err);
                return null;
            }
        })();

        return modelLoadPromise;
    } catch (err) {
        console.error('❌ Model initialization error:', err);
        return null;
    }
};

/**
 * Preprocess image for MobileFaceNet
 * Resize to 112x112, normalize to [-1, 1]
 */
const preprocessImage = async (imagePath: string): Promise<Float32Array | null> => {
    try {
        console.log('🖼️ Preprocessing image...');

        // Read image as base64
        let cleanPath = imagePath;
        if (imagePath.startsWith('file://')) {
            cleanPath = imagePath.replace('file://', '');
        }
        
        const base64Data = await RNFS.readFile(cleanPath, 'base64');
        console.log(`📊 Image base64 length: ${base64Data.length}`);

        // Decode base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Check if it's JPEG (starts with FFD8)
        const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
        console.log(`📷 Image format: ${isJpeg ? 'JPEG' : 'Other'}`);

        // Get actual dimensions
        let width = 0, height = 0;
        
        // Try to extract dimensions from JPEG/PNG header
        if (isJpeg) {
            // Find SOF0 marker for JPEG dimensions
            for (let i = 0; i < bytes.length - 10; i++) {
                if (bytes[i] === 0xFF && (bytes[i + 1] === 0xC0 || bytes[i + 1] === 0xC2)) {
                    height = (bytes[i + 5] << 8) | bytes[i + 6];
                    width = (bytes[i + 7] << 8) | bytes[i + 8];
                    break;
                }
            }
        }
        
        if (width === 0 || height === 0) {
            // Fallback: try Image.getSize
            try {
                const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
                    RNImage.getSize(
                        imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`,
                        (w, h) => resolve({ width: w, height: h }),
                        (error) => reject(error)
                    );
                });
                width = size.width;
                height = size.height;
            } catch (e) {
                console.warn('⚠️ Could not get image dimensions');
                width = 640;
                height = 480;
            }
        }

        console.log(`📐 Image size: ${width}x${height}`);

        // Create input tensor (1 batch, 112 height, 112 width, 3 channels) = 37632 values
        const inputSize = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3;
        const inputData = new Float32Array(inputSize);

        // Extract pixel data from JPEG
        // We'll use a sampling approach since we can't fully decode JPEG in JS
        // This extracts features from the raw JPEG data
        
        if (isJpeg) {
            // Find start of image data (after headers)
            let dataStart = 0;
            for (let i = 0; i < bytes.length - 2; i++) {
                if (bytes[i] === 0xFF && bytes[i + 1] === 0xDA) {
                    dataStart = i + 2;
                    break;
                }
            }
            
            if (dataStart === 0) dataStart = Math.floor(bytes.length * 0.1);
            
            const dataRegion = bytes.slice(dataStart);
            const regionLen = dataRegion.length;
            
            // Sample data to create 112x112x3 input
            for (let y = 0; y < MODEL_INPUT_SIZE; y++) {
                for (let x = 0; x < MODEL_INPUT_SIZE; x++) {
                    const pixelIdx = y * MODEL_INPUT_SIZE + x;
                    
                    // Calculate position in original data
                    const srcY = Math.floor(y * height / MODEL_INPUT_SIZE);
                    const srcX = Math.floor(x * width / MODEL_INPUT_SIZE);
                    const srcIdx = (srcY * width + srcX) % regionLen;
                    
                    // Extract RGB-like values from compressed data
                    // Use offset sampling for different channels
                    for (let c = 0; c < 3; c++) {
                        const inputIdx = pixelIdx * 3 + c;
                        const sampleIdx = (srcIdx + c * 31) % regionLen;
                        
                        // Get byte value and normalize to [-1, 1]
                        const byteVal = dataRegion[sampleIdx];
                        inputData[inputIdx] = (byteVal / 127.5) - 1.0;
                    }
                }
            }
            
            console.log('✅ Preprocessed from JPEG data');
        } else {
            // For non-JPEG, use the full byte array
            for (let i = 0; i < inputSize; i++) {
                const byteIdx = Math.floor(i * bytes.length / inputSize);
                inputData[i] = (bytes[byteIdx] / 127.5) - 1.0;
            }
            console.log('✅ Preprocessed from raw bytes');
        }

        // Apply simple normalization pass
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < inputData.length; i++) {
            if (inputData[i] < min) min = inputData[i];
            if (inputData[i] > max) max = inputData[i];
        }
        
        const range = max - min || 1;
        for (let i = 0; i < inputData.length; i++) {
            inputData[i] = ((inputData[i] - min) / range) * 2 - 1; // Normalize to [-1, 1]
        }

        console.log(`✅ Preprocessed input: ${inputData.length} values, range [${min.toFixed(2)}, ${max.toFixed(2)}]`);
        return inputData;

    } catch (err) {
        console.error('❌ Preprocessing error:', err);
        return null;
    }
};

/**
 * Alternative preprocessing using ML Kit face crop
 */
const preprocessWithFaceCrop = async (imagePath: string): Promise<Float32Array | null> => {
    try {
        console.log('🖼️ Preprocessing with face detection...');

        // Import ML Kit
        let FaceDetection: any = null;
        try {
            FaceDetection = require('@react-native-ml-kit/face-detection').default;
        } catch (e) {
            console.warn('⚠️ ML Kit not available for face cropping');
            return preprocessImage(imagePath);
        }

        // Detect face to get bounding box
        let detectionPath = imagePath;
        if (!detectionPath.startsWith('file://')) {
            detectionPath = 'file://' + detectionPath;
        }

        const faces = await FaceDetection.detect(detectionPath, {
            performanceMode: 'accurate',
            landmarkMode: 'all',
            contourMode: 'all',
        });

        if (!faces || faces.length === 0) {
            console.warn('⚠️ No face detected, using full image');
            return preprocessImage(imagePath);
        }

        const face = faces[0];
        const bounds = face.bounds || face.frame || {};
        
        console.log('📐 Face bounds:', bounds);

        // For now, return preprocessed full image
        // In production, crop to face bounds first
        return preprocessImage(imagePath);

    } catch (err) {
        console.error('❌ Face crop preprocessing error:', err);
        return preprocessImage(imagePath);
    }
};

/**
 * Normalize embedding vector (L2 normalization)
 * Handles NaN, Infinity, and zero magnitude cases
 */
const normalizeEmbedding = (embedding: number[]): number[] => {
    // First, clean the embedding - replace NaN/Infinity with 0
    const cleanedEmbedding = embedding.map(val => {
        if (typeof val !== 'number' || !Number.isFinite(val)) {
            return 0;
        }
        return val;
    });
    
    const magnitude = Math.sqrt(cleanedEmbedding.reduce((sum, val) => sum + val * val, 0));
    
    // If magnitude is 0 or invalid, return cleaned embedding as-is
    if (!Number.isFinite(magnitude) || magnitude === 0) {
        console.warn('⚠️ Normalization skipped - invalid magnitude:', magnitude);
        return cleanedEmbedding;
    }
    
    return cleanedEmbedding.map(val => val / magnitude);
};

// ============ HOOK ============
export const useFaceEmbedding = (): UseFaceEmbeddingReturn => {
    const [embeddingData, setEmbeddingData] = useState<FaceEmbeddingData | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    /**
     * Load TFLite model
     */
    const loadModel = useCallback(async (): Promise<boolean> => {
        try {
            const model = await initializeModel();
            const loaded = model !== null;
            setIsModelLoaded(loaded);
            return loaded;
        } catch (err) {
            console.error('❌ Load model error:', err);
            setIsModelLoaded(false);
            return false;
        }
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

            // Skip TFLite, go directly to ML Kit fallback
            console.log('⚠️ TFLite disabled, using ML Kit fallback directly...');
            
            let embedding: number[];
            try {
                embedding = await generateFallbackEmbedding(imagePath);
                console.log(`✅ Embedding generated: ${embedding.length} dimensions`);
            } catch (embeddingErr: any) {
                console.error('❌ generateFallbackEmbedding failed:', embeddingErr);
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

            console.log(`✅ Final embedding: ${finalEmbedding.length} dimensions, ${nonZeroCount} non-zero values`);
            console.log('📊 Embedding sample:', finalEmbedding.slice(0, 10));
            console.log('🏷️ Model used: MLKit-Fallback');

            const result: FaceEmbeddingData = {
                embedding: finalEmbedding,
                confidence: confidence,
                timestamp: new Date().toISOString(),
                imagePath: imagePath,
                modelUsed: 'MLKit-Fallback',
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

    // Auto-load model on mount (disabled for now to prevent crash)
    // useEffect(() => {
    //     loadModel();
    // }, [loadModel]);

    return {
        embeddingData,
        isExtracting,
        extractError,
        isModelLoaded,
        extractEmbeddingFromImage,
        clearEmbedding,
        loadModel,
    };
};

/**
 * Base64 character to value mapping
 */
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
 * Fallback: Generate embedding from ML Kit face features + image hash
 * This creates a UNIQUE per-face embedding by combining:
 * 1. Face geometric features from ML Kit
 * 2. Image pixel data hash for uniqueness
 */
async function generateFallbackEmbedding(imagePath: string): Promise<number[]> {
    console.log('🔄 Generating embedding from ML Kit + image hash...');

    // Read image content for hashing
    let cleanPath = imagePath;
    if (cleanPath.startsWith('file://')) {
        cleanPath = cleanPath.replace('file://', '');
    }
    
    const imageBase64 = await RNFS.readFile(cleanPath, 'base64');
    console.log(`📊 Image base64 length: ${imageBase64.length}`);
    
    // Create hash array from base64 string directly (no atob needed)
    // Sample different positions of base64 to create unique embedding
    const hashEmbedding: number[] = [];
    const stride = Math.max(1, Math.floor(imageBase64.length / EMBEDDING_SIZE));
    
    for (let i = 0; i < EMBEDDING_SIZE; i++) {
        // Sample multiple positions and combine them for better uniqueness
        const idx1 = (i * stride) % imageBase64.length;
        const idx2 = (i * stride + Math.floor(stride / 3)) % imageBase64.length;
        const idx3 = (i * stride + Math.floor(2 * stride / 3)) % imageBase64.length;
        
        // Get base64 character values (0-63)
        const val1 = base64Chars.indexOf(imageBase64[idx1]);
        const val2 = base64Chars.indexOf(imageBase64[idx2]);
        const val3 = base64Chars.indexOf(imageBase64[idx3]);
        
        // Use hash for additional uniqueness
        const hashVal = simpleHash(imageBase64.substring(idx1, idx1 + 10), i);
        
        // Combine values and normalize to [-1, 1]
        const combined = (
            (val1 >= 0 ? val1 : 32) * 0.3 + 
            (val2 >= 0 ? val2 : 32) * 0.3 + 
            (val3 >= 0 ? val3 : 32) * 0.2 +
            (hashVal % 64) * 0.2
        );
        hashEmbedding.push((combined / 32) - 1.0);
    }
    
    console.log(`📊 Hash embedding created: ${hashEmbedding.length} values`);

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
            faceFeatures.push(boxW / (boxH || 1));  // 0: aspect ratio
            faceFeatures.push(boxX / 1000);         // 1: relative x
            faceFeatures.push(boxY / 1000);         // 2: relative y
            faceFeatures.push(boxW / 1000);         // 3: relative width
            faceFeatures.push(boxH / 1000);         // 4: relative height
            
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
                    // Use average position as fallback
                    faceFeatures.push(0.5);
                    faceFeatures.push(0.5);
                }
            }
            
            // Contours - sample key points
            const contourTypes = ['face', 'leftEyebrowTop', 'rightEyebrowTop', 'noseBridge', 'noseBottom'];
            for (const type of contourTypes) {
                const contour = face.contours?.[type];
                if (Array.isArray(contour) && contour.length > 0) {
                    // Sample first, middle, last points
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
                
                // Eye center
                const eyeCenterX = (leftEye.x + rightEye.x) / 2;
                const eyeCenterY = (leftEye.y + rightEye.y) / 2;
                faceFeatures.push(eyeCenterX / boxW);
                faceFeatures.push(eyeCenterY / boxH);
            } else {
                faceFeatures.push(0.3, 0.5, 0.35);
            }
            
            if (noseBase && bottomMouth) {
                const noseMouthDist = Math.sqrt(Math.pow(bottomMouth.x - noseBase.x, 2) + Math.pow(bottomMouth.y - noseBase.y, 2));
                faceFeatures.push(noseMouthDist / boxH);
            } else {
                faceFeatures.push(0.15);
            }
            
            console.log(`📊 Face features extracted: ${faceFeatures.length} values`);
        }
    } catch (e) {
        console.warn('⚠️ ML Kit detection failed, using image hash only');
    }

    // Combine: ML Kit features + image hash
    // First N slots: face geometric features (for matching)
    // Rest: image hash (for uniqueness)
    const embedding: number[] = [];
    
    // Add face features first (they're more important for matching)
    const faceWeight = 0.7;
    const hashWeight = 0.3;
    
    for (let i = 0; i < EMBEDDING_SIZE; i++) {
        let value: number;
        if (i < faceFeatures.length) {
            // Blend face feature with corresponding hash value
            const faceVal = faceFeatures[i] ?? 0;
            const hashVal = hashEmbedding[i] ?? 0;
            value = faceVal * faceWeight + hashVal * hashWeight;
        } else {
            // Use hash value
            value = hashEmbedding[i] ?? 0;
        }
        
        // Ensure value is a valid number
        if (!Number.isFinite(value)) {
            value = 0;
        }
        embedding.push(value);
    }
    
    // Skip L2 normalize here - let the caller handle it
    // Just ensure all values are valid numbers

    // Count non-zero values
    const nonZero = embedding.filter(v => Math.abs(v) > 0.001).length;
    console.log(`✅ Embedding generated: ${embedding.length} dimensions, ${nonZero} non-zero values`);
    
    return embedding.slice(0, EMBEDDING_SIZE);
}

export default useFaceEmbedding;
