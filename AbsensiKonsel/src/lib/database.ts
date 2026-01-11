/**
 * ============================================
 * DATABASE HELPER - ABSENSI OFFLINE
 * ============================================
 * SQLite database untuk menyimpan data absensi offline
 * Data akan disimpan sampai berhasil sync ke server
 */

import SQLite, {
  SQLiteDatabase,
  ResultSet,
} from 'react-native-sqlite-storage';

// Aktifkan debugging (nonaktifkan di production)
SQLite.enablePromise(true);
SQLite.DEBUG(__DEV__);

// ============ TIPE DATA ============

// Status absensi setelah validasi server
// 0 = pending (menunggu validasi)
// 1 = accepted (diterima)
// 2 = rejected (ditolak)
export type AbsensiStatus = 0 | 1 | 2;

export const ABSENSI_STATUS = {
  PENDING: 0 as AbsensiStatus,
  ACCEPTED: 1 as AbsensiStatus,
  REJECTED: 2 as AbsensiStatus,
};

export interface AbsensiOffline {
  id?: number;
  nip: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  image_path: string;
  status: AbsensiStatus;        // 0=pending, 1=accepted, 2=rejected
  description: string;          // Deskripsi hasil validasi dari server
  is_synced: number;            // 0 = belum sync, 1 = sudah sync
  created_at: string;
  synced_at?: string | null;
}

export interface AbsensiOfflineInput {
  nip: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  image_path: string;
}

export interface ServerValidationResult {
  status: AbsensiStatus;
  description: string;
}

// ============ KONSTANTA ============
const DATABASE_NAME = 'AbsensiOffline.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'Absensi Offline Database';
const DATABASE_SIZE = 200000; // 200KB

// ============ SINGLETON DATABASE ============
let dbInstance: SQLiteDatabase | null = null;

/**
 * Mendapatkan instance database (singleton pattern)
 */
const getDatabase = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });
    console.log('📦 Database terbuka:', DATABASE_NAME);
    return dbInstance;
  } catch (error) {
    console.error('❌ Gagal membuka database:', error);
    throw error;
  }
};

/**
 * Inisialisasi database dan buat tabel jika belum ada
 */
export const initDatabase = async (): Promise<void> => {
  try {
    const db = await getDatabase();

    // Buat tabel absensi_offline
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS absensi_offline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nip TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp TEXT NOT NULL,
        image_path TEXT NOT NULL,
        status INTEGER DEFAULT 0,
        description TEXT DEFAULT 'Menunggu sinkronisasi',
        is_synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        synced_at TEXT
      );
    `);

    // Buat index untuk query yang sering digunakan
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_nip ON absensi_offline(nip);
    `);
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_is_synced ON absensi_offline(is_synced);
    `);
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON absensi_offline(timestamp);
    `);
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_status ON absensi_offline(status);
    `);

    console.log('✅ Database berhasil diinisialisasi');
  } catch (error) {
    console.error('❌ Gagal inisialisasi database:', error);
    throw error;
  }
};

/**
 * Simpan data absensi offline baru
 */
export const saveAbsensiOffline = async (
  data: AbsensiOfflineInput,
): Promise<number> => {
  try {
    const db = await getDatabase();
    const createdAt = new Date().toISOString();

    const [result] = await db.executeSql(
      `INSERT INTO absensi_offline (nip, latitude, longitude, timestamp, image_path, status, description, is_synced, created_at)
       VALUES (?, ?, ?, ?, ?, 0, 'Menunggu sinkronisasi', 0, ?);`,
      [
        data.nip,
        data.latitude,
        data.longitude,
        data.timestamp,
        data.image_path,
        createdAt,
      ],
    );

    const insertId = result.insertId;
    console.log('✅ Data absensi tersimpan dengan ID:', insertId);
    return insertId;
  } catch (error) {
    console.error('❌ Gagal menyimpan absensi:', error);
    throw error;
  }
};

/**
 * Ambil semua data absensi yang belum di-sync
 */
export const getUnsyncedAbsensi = async (): Promise<AbsensiOffline[]> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM absensi_offline WHERE is_synced = 0 ORDER BY created_at ASC;`,
    );

    const absensiList: AbsensiOffline[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      absensiList.push(result.rows.item(i));
    }

    console.log(`📋 Ditemukan ${absensiList.length} absensi belum sync`);
    return absensiList;
  } catch (error) {
    console.error('❌ Gagal mengambil data unsynced:', error);
    throw error;
  }
};

/**
 * Ambil semua data absensi
 */
export const getAllAbsensi = async (): Promise<AbsensiOffline[]> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM absensi_offline ORDER BY created_at DESC;`,
    );

    const absensiList: AbsensiOffline[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      absensiList.push(result.rows.item(i));
    }

    console.log(`📋 Total ${absensiList.length} data absensi`);
    return absensiList;
  } catch (error) {
    console.error('❌ Gagal mengambil semua data:', error);
    throw error;
  }
};

/**
 * Ambil data absensi berdasarkan NIP
 */
export const getAbsensiByNip = async (nip: string): Promise<AbsensiOffline[]> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM absensi_offline WHERE nip = ? ORDER BY created_at DESC;`,
      [nip],
    );

    const absensiList: AbsensiOffline[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      absensiList.push(result.rows.item(i));
    }

    return absensiList;
  } catch (error) {
    console.error('❌ Gagal mengambil data by NIP:', error);
    throw error;
  }
};

/**
 * Ambil data absensi berdasarkan status (pending/accepted/rejected)
 */
export const getAbsensiByStatus = async (status: AbsensiStatus): Promise<AbsensiOffline[]> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM absensi_offline WHERE status = ? ORDER BY created_at DESC;`,
      [status],
    );

    const absensiList: AbsensiOffline[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      absensiList.push(result.rows.item(i));
    }

    const statusLabel = status === 0 ? 'pending' : status === 1 ? 'accepted' : 'rejected';
    console.log(`📋 Ditemukan ${absensiList.length} absensi dengan status: ${statusLabel}`);
    return absensiList;
  } catch (error) {
    console.error('❌ Gagal mengambil data by status:', error);
    throw error;
  }
};

/**
 * Hitung jumlah data berdasarkan status
 */
export const countAbsensiByStatus = async (status: AbsensiStatus): Promise<number> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT COUNT(*) as count FROM absensi_offline WHERE status = ?;`,
      [status],
    );

    const count = result.rows.item(0).count;
    return count;
  } catch (error) {
    console.error('❌ Gagal hitung by status:', error);
    throw error;
  }
};

/**
 * Ambil ringkasan statistik absensi
 */
export const getAbsensiStats = async (): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  unsynced: number;
}> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN is_synced = 0 THEN 1 ELSE 0 END) as unsynced
      FROM absensi_offline;
    `);

    const row = result.rows.item(0);
    return {
      total: row.total || 0,
      pending: row.pending || 0,
      accepted: row.accepted || 0,
      rejected: row.rejected || 0,
      unsynced: row.unsynced || 0,
    };
  } catch (error) {
    console.error('❌ Gagal mengambil statistik:', error);
    throw error;
  }
};

/**
 * Ambil data absensi berdasarkan tanggal
 */
export const getAbsensiByDate = async (date: string): Promise<AbsensiOffline[]> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM absensi_offline WHERE DATE(timestamp) = ? ORDER BY created_at DESC;`,
      [date],
    );

    const absensiList: AbsensiOffline[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      absensiList.push(result.rows.item(i));
    }

    return absensiList;
  } catch (error) {
    console.error('❌ Gagal mengambil data by date:', error);
    throw error;
  }
};

/**
 * Update status sync setelah berhasil kirim ke server
 */
export const markAsSynced = async (
  id: number,
  validationResult: ServerValidationResult,
): Promise<void> => {
  try {
    const db = await getDatabase();
    const syncedAt = new Date().toISOString();

    await db.executeSql(
      `UPDATE absensi_offline 
       SET is_synced = 1, synced_at = ?, status = ?, description = ? 
       WHERE id = ?;`,
      [syncedAt, validationResult.status, validationResult.description, id],
    );

    const statusLabel = validationResult.status === 0 ? 'pending' : validationResult.status === 1 ? 'accepted' : 'rejected';
    console.log('✅ Absensi ID', id, 'ditandai sudah sync dengan status:', statusLabel);
  } catch (error) {
    console.error('❌ Gagal update status sync:', error);
    throw error;
  }
};

/**
 * Update status sync untuk multiple ID sekaligus (dengan status yang sama)
 */
export const markMultipleAsSynced = async (
  ids: number[],
  validationResult: ServerValidationResult,
): Promise<void> => {
  try {
    const db = await getDatabase();
    const syncedAt = new Date().toISOString();
    const placeholders = ids.map(() => '?').join(',');

    await db.executeSql(
      `UPDATE absensi_offline 
       SET is_synced = 1, synced_at = ?, status = ?, description = ? 
       WHERE id IN (${placeholders});`,
      [syncedAt, validationResult.status, validationResult.description, ...ids],
    );

    const statusLabel = validationResult.status === 0 ? 'pending' : validationResult.status === 1 ? 'accepted' : 'rejected';
    console.log('✅', ids.length, 'absensi ditandai sudah sync dengan status:', statusLabel);
  } catch (error) {
    console.error('❌ Gagal update multiple sync:', error);
    throw error;
  }
};

/**
 * Hapus data absensi yang sudah di-sync (untuk menghemat storage)
 */
export const deleteSyncedAbsensi = async (): Promise<number> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `DELETE FROM absensi_offline WHERE is_synced = 1;`,
    );

    const deletedCount = result.rowsAffected;
    console.log('🗑️', deletedCount, 'data synced dihapus');
    return deletedCount;
  } catch (error) {
    console.error('❌ Gagal hapus data synced:', error);
    throw error;
  }
};

/**
 * Hapus data absensi berdasarkan ID
 */
export const deleteAbsensiById = async (id: number): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.executeSql(`DELETE FROM absensi_offline WHERE id = ?;`, [id]);
    console.log('🗑️ Absensi ID', id, 'dihapus');
  } catch (error) {
    console.error('❌ Gagal hapus data:', error);
    throw error;
  }
};

/**
 * Hitung jumlah data yang belum di-sync
 */
export const countUnsyncedAbsensi = async (): Promise<number> => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT COUNT(*) as count FROM absensi_offline WHERE is_synced = 0;`,
    );

    const count = result.rows.item(0).count;
    return count;
  } catch (error) {
    console.error('❌ Gagal hitung unsynced:', error);
    throw error;
  }
};

/**
 * Tutup koneksi database
 */
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    try {
      await dbInstance.close();
      dbInstance = null;
      console.log('📦 Database ditutup');
    } catch (error) {
      console.error('❌ Gagal menutup database:', error);
      throw error;
    }
  }
};

/**
 * Reset database (hapus semua data) - HANYA UNTUK TESTING
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.executeSql(`DELETE FROM absensi_offline;`);
    console.log('⚠️ Database direset - semua data dihapus');
  } catch (error) {
    console.error('❌ Gagal reset database:', error);
    throw error;
  }
};
