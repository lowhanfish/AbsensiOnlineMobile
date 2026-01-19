# TODO - Perbaikan Modal DaruratSettings

## Masalah

Item di DaruratItem.tsx tidak bisa membuka modal DaruratSettings.tsx

## Rencana Perbaikan

### 1. Darurat.jsx

- [ ] Menambahkan prop `key` pada DaruratItem di map()
- [ ] Membuat fungsi `handleItemPress` yang memusatkan logika
- [ ] Meneruskan `onItemPress` ke DaruratItem

### 2. DaruratItem.tsx

- [ ] Mengganti props `setSelectedItem` dan `setModalVisible` dengan `onPress`
- [ ] Menyederhanakan komponen untuk memanggil `onPress(item)` saja

### 3. DaruratSettings.tsx

- [ ] Menambahkan console.log untuk debugging
- [ ] Memastikan props diterima dengan benar

## Status

- [x] Analisis masalah selesai
- [ ] Implementasi perbaikan
- [ ] Testing
