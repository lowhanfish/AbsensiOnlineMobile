
const DEFAULT_THRESHOLD = 0.5;

const pencocokan_wajah = (vektor_sampel, vektor_absensi) => {
    // Hitung cosine similarity
    const dotProduct = vektor_sampel.reduce((sum, val, i) => sum + val * vektor_absensi[i], 0);
    const normA = Math.sqrt(vektor_sampel.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vektor_absensi.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (normA * normB);

    return {
        similarity, // Nilai kemiripan (0-1)
        match: similarity >= DEFAULT_THRESHOLD // true jika cocok, false jika tidak
    };
}



module.exports = {
    pencocokan_wajah : pencocokan_wajah,

}