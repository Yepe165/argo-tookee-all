# Fitur Penjualan, Penghasilan & Sales (v2.1)

## Yang baru
- **Harga per lisensi**: diisi saat Buat Lisensi (otomatis dari Paket, bisa diubah) dan saat Perpanjang.
- **Tab Laporan**: pendapatan kotor, total bonus sales, pendapatan bersih, jumlah penjualan per bulan,
  grafik 6 bulan, rincian per paket, per sales, dan daftar transaksi. Pindah bulan dengan tombol ‹ ›.
- **Tab Sales**: kelola daftar sales (bonus default nominal tetap ATAU persen dari harga) dan daftar Paket & harga.
- **Sales per lisensi**: tiap lisensi bisa dipasangkan ke sales yang berbeda; bonus terisi otomatis
  dari default sales tapi bisa diketik manual per lisensi.
- **Lisensi lama**: ketuk "Penjualan" di tab Daftar untuk mengisi harga/sales/tanggal transaksi.
- **Perpanjang** kini mencatat transaksi baru (harga + sales + bonus), jadi masuk laporan bulan perpanjangan.

## Wajib: izinkan koleksi baru di Firestore
Paket & sales disimpan di dokumen `admin_config/main`. Tambahkan aturan ini di
Firebase Console → Firestore → Rules (samakan email dengan aturan `licenses` Anda):

```
match /admin_config/{doc} {
  allow read, write: if request.auth != null
    && request.auth.token.email == "EMAIL-ADMIN-ANDA";
}
```

Jika aturan `licenses` Anda membatasi field yang boleh ditulis, tambahkan field baru: `trx`.
Tanpa aturan di atas, aplikasi tetap jalan, tetapi paket & sales hanya tersimpan di HP/browser itu
(akan muncul peringatan kuning di tab Sales).

## Catatan
- Data transaksi disimpan di field `trx` (JSON) pada tiap dokumen lisensi. Menghapus lisensi juga
  menghapus transaksinya dari laporan.
- Bulan dihitung berdasarkan zona waktu perangkat.
- Pengingat WA otomatis (api/cron-reminder.js) tidak terpengaruh.
