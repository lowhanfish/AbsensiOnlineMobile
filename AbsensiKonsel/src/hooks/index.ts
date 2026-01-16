/**
 * ============================================
 * HOOKS INDEX
 * ============================================
 * Export semua custom hooks
 * 
 * catatan: useLivenessDetection sudah di-merge ke useFaceVector
 */

// Main hooks
export { useFaceVector } from './useFaceVector';
export { useFaceEmbedding } from './useFaceEmbedding'; // Simpan tapi tidak digunakan (bisa dihapus nanti)

// Types untuk useFaceVector
export type { 
    FaceCropResult, 
    UseFaceVectorReturn,
    LivenessResult 
} from './useFaceVector';

// Types untuk useFaceEmbedding (simpan untuk referensi)
export type { 
    FaceEmbeddingData, 
    UseFaceEmbeddingReturn 
} from './useFaceEmbedding';

// DEPRECATED - useFaceEmbedding tidak lagi digunakan
// Foto wajah akan diproses di server (RTX 5090)
// Mobile hanya: capture → crop → resize → upload

