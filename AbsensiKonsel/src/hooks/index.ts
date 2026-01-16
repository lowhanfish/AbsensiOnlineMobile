/**
 * ============================================
 * HOOKS INDEX
 * ============================================
 * 
 * ARSIKTURE BARU: Client-side hanya untuk passive capture
 * Seluruh proses AI (embedding, comparison) dilakukan di SERVER (RTX 5090)
 * 
 * Mobile hanya: Capture Foto → Resize → Upload ke Server
 * Server (RTX 5090): Face Detection → Embedding → Comparison
 */

// Passive Capture Hook (NEW - simplified)
export { 
    usePassiveCapture, 
    uploadPhotoToServer, 
    cleanupPhoto,
    CapturedPhoto,
    UsePassiveCaptureReturn,
    UploadResult
} from './useLivenessDetection';

