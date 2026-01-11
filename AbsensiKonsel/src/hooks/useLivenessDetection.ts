/**
 * ============================================
 * HOOK: useLivenessDetection
 * ============================================
 * Hook untuk mendeteksi liveness menggunakan gesture-based detection
 * Mendukung: kedip mata, senyum, tutup mata kanan
 */

import { useState, useCallback, RefObject } from 'react';
import { Camera } from 'react-native-vision-camera';
import * as RNFS from 'react-native-fs';

// Import ML Kit Face Detection
let FaceDetection: any = null;
try {
    FaceDetection = require('@react-native-ml-kit/face-detection').default;
} catch (e) {
    console.warn('⚠️ ML Kit tidak tersedia');
}

// ============ TYPES ============
export interface GestureInstruction {
    id: string;
    text: string;
}

export interface LivenessResult {
    isLive: boolean;
    score: number;
    reason: string;
    results: { [key: string]: boolean };
    finalPhotoPath: string | null;
}

export interface UseLivenessDetectionReturn {
    gestureInstructions: GestureInstruction[];
    detectionStatus: string;
    isDetecting: boolean;
    performLivenessCheck: (cameraRef: RefObject<Camera | null>) => Promise<LivenessResult>;
    setDetectionStatus: (status: string) => void;
}

// ============ GESTURE INSTRUCTIONS ============
const GESTURE_INSTRUCTIONS: GestureInstruction[] = [
    { id: 'blink', text: '👁️ KEDIP MATA' },
    { id: 'smile', text: '😊 SENYUM' },
    { id: 'right_eye_close', text: '➡️ TUTUP MATA KANAN' },
];

// ============ HOOK ============
export const useLivenessDetection = (): UseLivenessDetectionReturn => {
    const [detectionStatus, setDetectionStatus] = useState('📷 Siap untuk verifikasi');
    const [isDetecting, setIsDetecting] = useState(false);

    /**
     * Ambil 2 gesture secara random
     */
    const getRandomGestures = useCallback((): GestureInstruction[] => {
        const shuffled = [...GESTURE_INSTRUCTIONS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
    }, []);

    /**
     * Analisis frame untuk mendeteksi gesture
     */
    const analyzeGestureFrames = useCallback((gesture: GestureInstruction, frames: any[]): boolean => {
        try {
            console.log(`📊 Analyzing ${frames.length} frames for gesture: ${gesture.id}`);

            if (frames.length < 3) {
                console.log('❌ Not enough frames');
                return false;
            }

            switch (gesture.id) {
                case 'blink': {
                    let hasEyeClosure = false;
                    let hasEyeOpen = false;

                    for (const frame of frames) {
                        const leftEye = frame.leftEyeOpen ?? 1;
                        const rightEye = frame.rightEyeOpen ?? 1;
                        const avgEye = (leftEye + rightEye) / 2;

                        if (avgEye < 0.3) {
                            hasEyeClosure = true;
                            console.log(`✅ Eye closure detected: left=${leftEye.toFixed(2)}, right=${rightEye.toFixed(2)}`);
                        }
                        if (avgEye > 0.7) {
                            hasEyeOpen = true;
                        }
                    }

                    const blinkDetected = hasEyeClosure && hasEyeOpen;
                    console.log(`📊 Blink analysis: closure=${hasEyeClosure}, open=${hasEyeOpen}, blink=${blinkDetected}`);
                    return blinkDetected;
                }

                case 'smile': {
                    let hasSmile = false;
                    let hasNeutral = false;
                    let minSmileProb = 1;
                    let maxSmileProb = 0;

                    for (const frame of frames) {
                        const smileProbability = frame.face.smilingProbability ?? 0.5;
                        minSmileProb = Math.min(minSmileProb, smileProbability);
                        maxSmileProb = Math.max(maxSmileProb, smileProbability);

                        console.log(`😊 Smile probability: ${(smileProbability * 100).toFixed(1)}%`);

                        if (smileProbability > 0.6) hasSmile = true;
                        if (smileProbability < 0.4) hasNeutral = true;
                    }

                    console.log(`📊 Smile: min ${(minSmileProb * 100).toFixed(1)}%, max ${(maxSmileProb * 100).toFixed(1)}%`);
                    const smileDetected = hasSmile && hasNeutral;
                    console.log(`✅ Smile: ${smileDetected ? 'DETECTED' : 'REJECTED'}`);
                    return smileDetected;
                }

                case 'right_eye_close': {
                    let hasRightClosed = false;
                    let hasRightOpen = false;

                    for (const frame of frames) {
                        const rightEye = frame.rightEyeOpen ?? 1;
                        const leftEye = frame.leftEyeOpen ?? 1;

                        console.log(`👁️ Mata kanan: ${(rightEye * 100).toFixed(1)}%, Mata kiri: ${(leftEye * 100).toFixed(1)}%`);

                        if (rightEye < 0.3 && leftEye > 0.5) {
                            hasRightClosed = true;
                            console.log(`✅ Mata kanan tertutup terdeteksi`);
                        }
                        if (rightEye > 0.6 && leftEye > 0.6) {
                            hasRightOpen = true;
                        }
                    }

                    const rightEyeCloseDetected = hasRightClosed && hasRightOpen;
                    console.log(`📊 Tutup mata kanan: tertutup=${hasRightClosed}, terbuka=${hasRightOpen}, terdeteksi=${rightEyeCloseDetected}`);
                    return rightEyeCloseDetected;
                }

                default:
                    return false;
            }
        } catch (err: any) {
            console.error('❌ Analysis error:', err?.message);
            return false;
        }
    }, []);

    /**
     * Rekam frame dan deteksi gesture
     */
    const recordGestureFrames = useCallback(async (
        gesture: GestureInstruction,
        cameraRef: RefObject<Camera | null>
    ): Promise<boolean> => {
        try {
            console.log(`📹 Recording frames for: ${gesture.text}`);

            const framePaths: string[] = [];
            const maxDuration = 10000;
            const startTime = Date.now();
            let isRecording = true;

            const captureFrameLoop = async () => {
                while (isRecording && Date.now() - startTime < maxDuration) {
                    if (!cameraRef.current) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        continue;
                    }

                    try {
                        const photo = await cameraRef.current.takePhoto();
                        if (photo) {
                            framePaths.push(photo.path);
                            console.log(`📹 Frame captured (${framePaths.length})`);
                        }
                    } catch (photoErr: any) {
                        console.warn('⚠️ Photo error:', photoErr?.message);
                    }

                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                console.log(`📹 Capture loop finished - ${framePaths.length} frames total`);
            };

            const capturePromise = captureFrameLoop();
            await new Promise(resolve => setTimeout(resolve, 2500));
            isRecording = false;
            await capturePromise;

            console.log(`📹 Recording finished - captured ${framePaths.length} frames`);

            if (framePaths.length < 3) {
                console.log(`❌ Too few frames: ${framePaths.length}`);
                for (const path of framePaths) {
                    try { await RNFS.unlink(path); } catch (e) { }
                }
                return false;
            }

            // Deteksi wajah di setiap frame
            const frames: any[] = [];
            for (let i = 0; i < framePaths.length; i++) {
                try {
                    let detectionPath = framePaths[i];
                    if (!detectionPath.startsWith('file://')) {
                        detectionPath = 'file://' + detectionPath;
                    }

                    if (FaceDetection && FaceDetection.detect) {
                        const faces = await FaceDetection.detect(detectionPath, {
                            performanceMode: 'fast',
                            classificationMode: 'all',
                            landmarkMode: 'all',
                        });
                        if (faces && faces.length > 0) {
                            const face = faces[0];
                            frames.push({
                                face: face,
                                frameIndex: i,
                                timestamp: Date.now(),
                                leftEyeOpen: face.leftEyeOpenProbability,
                                rightEyeOpen: face.rightEyeOpenProbability,
                            });
                            console.log(`✅ Frame ${i + 1}: Face detected`);
                        }
                    }
                } catch (e) {
                    console.warn(`⚠️ Detection error for frame ${i}:`, (e as any)?.message);
                }
            }

            console.log(`📊 Detected faces in ${frames.length}/${framePaths.length} frames`);

            let gestureDetected = false;
            if (frames.length >= 3) {
                gestureDetected = analyzeGestureFrames(gesture, frames);
                console.log(`📊 Gesture analysis: ${gesture.id} = ${gestureDetected}`);
            } else {
                console.log(`❌ Insufficient face detections: ${frames.length}/3`);
            }

            // Cleanup
            for (const path of framePaths) {
                try { await RNFS.unlink(path); } catch (e) { }
            }

            return gestureDetected;

        } catch (err: any) {
            console.warn('⚠️ Recording error:', err?.message);
            return false;
        }
    }, [analyzeGestureFrames]);

    /**
     * Main function: Perform liveness check
     */
    const performLivenessCheck = useCallback(async (
        cameraRef: RefObject<Camera | null>
    ): Promise<LivenessResult> => {
        try {
            setIsDetecting(true);
            console.log('🎬 Memulai liveness berbasis gesture...');

            if (!FaceDetection || !FaceDetection.detect) {
                return {
                    isLive: false,
                    score: 0,
                    reason: 'ML Kit tidak tersedia',
                    results: {},
                    finalPhotoPath: null
                };
            }

            const selectedGestures = getRandomGestures();
            console.log('📋 Gesture terpilih:', selectedGestures.map(g => g.text));

            const results: { [key: string]: boolean } = {};

            // Proses setiap gesture
            for (let i = 0; i < selectedGestures.length; i++) {
                const gesture = selectedGestures[i];
                let gestureDetected = false;
                let attemptCount = 0;
                const maxAttempts = 3;

                while (!gestureDetected && attemptCount < maxAttempts) {
                    attemptCount++;
                    setDetectionStatus(`${gesture.text}\n(Upaya ${attemptCount}/${maxAttempts})`);

                    console.log(`🎬 Gesture ${i + 1}/${selectedGestures.length}: ${gesture.text} (Upaya ${attemptCount})`);

                    gestureDetected = await recordGestureFrames(gesture, cameraRef);

                    if (gestureDetected) {
                        console.log(`✅ Gesture terdeteksi pada upaya ${attemptCount}!`);
                        setDetectionStatus(`✅ ${gesture.text} - Terdeteksi!`);
                        results[gesture.id] = true;
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    } else if (attemptCount < maxAttempts) {
                        console.log(`❌ Gesture TIDAK terdeteksi, upaya ${attemptCount}/${maxAttempts}`);
                        setDetectionStatus(`❌ Tidak terdeteksi\nCoba lagi... (${maxAttempts - attemptCount} kesempatan)`);
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                }

                if (!gestureDetected) {
                    console.log(`❌ Gesture ${gesture.id} gagal setelah ${maxAttempts} upaya - REJECT`);
                    setDetectionStatus(`❌ ${gesture.text}\nGagal - Verifikasi dibatalkan`);
                    results[gesture.id] = false;

                    return {
                        isLive: false,
                        score: 0,
                        reason: `Gesture "${gesture.text}" gagal terdeteksi`,
                        results,
                        finalPhotoPath: null
                    };
                }
            }

            // SEMUA GESTURE BERHASIL - Ambil foto diam
            console.log('📸 Semua gesture berhasil, mengambil foto diam...');
            setDetectionStatus('📸 DIAM - Jangan bergerak\nMengambil foto...');

            await new Promise(resolve => setTimeout(resolve, 1000));

            let finalPhotoPath: string | null = null;
            try {
                if (cameraRef.current) {
                    const stillPhoto = await cameraRef.current.takePhoto();
                    if (stillPhoto && stillPhoto.path) {
                        finalPhotoPath = stillPhoto.path;
                        console.log('✅ Foto diam berhasil diambil:', finalPhotoPath);
                    }
                }
            } catch (photoErr: any) {
                console.warn('⚠️ Gagal mengambil foto diam:', photoErr?.message);
            }

            if (!finalPhotoPath) {
                return {
                    isLive: false,
                    score: 0,
                    reason: 'Gagal mengambil foto final',
                    results,
                    finalPhotoPath: null
                };
            }

            console.log(`📊 Hasil gesture: ${selectedGestures.length}/${selectedGestures.length} terdeteksi`);

            return {
                isLive: true,
                score: 1.0,
                reason: `Semua ${selectedGestures.length} gerakan terdeteksi - Liveness terverifikasi`,
                results,
                finalPhotoPath
            };

        } catch (err: any) {
            console.error('❌ Error capture gesture:', err?.message);
            return {
                isLive: false,
                score: 0,
                reason: 'Deteksi gesture gagal',
                results: {},
                finalPhotoPath: null
            };
        } finally {
            setIsDetecting(false);
        }
    }, [getRandomGestures, recordGestureFrames]);

    return {
        gestureInstructions: GESTURE_INSTRUCTIONS,
        detectionStatus,
        isDetecting,
        performLivenessCheck,
        setDetectionStatus,
    };
};

export default useLivenessDetection;
