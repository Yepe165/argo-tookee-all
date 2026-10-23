# Pengingat WA otomatis (H-1) — Argo Tookee

Setiap hari pukul 08.00 WIB, server Vercel mengecek lisensi yang berakhir BESOK
dan mengirim pesan WhatsApp ke pelanggan secara otomatis lewat Fonnte.

## 1. Siapkan Fonnte (pengirim WA)
1. Daftar di https://fonnte.com, tambahkan device, lalu scan QR dengan nomor WA pengirim.
   Disarankan pakai nomor khusus usaha (bukan nomor pribadi).
2. Salin **token** dari menu Device.

## 2. Isi Environment Variables di Vercel
Vercel → Project → Settings → Environment Variables:

| Nama            | Isi                                                       |
|-----------------|-----------------------------------------------------------|
| FONNTE_TOKEN    | token dari Fonnte                                         |
| ADMIN_EMAIL     | email admin (sama dengan email login aplikasi)            |
| ADMIN_PASSWORD  | password admin tersebut                                   |
| CRON_SECRET     | kata acak panjang buatan Anda (mis. 32 karakter)          |
| APP_URL         | alamat aplikasi pelanggan (opsional, tampil di pesan)     |

Lalu **Redeploy** proyek.

## 3. Unggah file
Letakkan dalam satu folder yang sama:
index.html, manifest.webmanifest, sw.js, vercel.json, folder `icons/`, folder `api/`.

## 4. Tes
Buka (ganti RAHASIA dengan CRON_SECRET) — lewat aplikasi seperti Postman/curl:
  GET https://alamat-anda.vercel.app/api/cron-reminder?dry=1
  Header:  Authorization: Bearer RAHASIA
`dry=1` hanya menampilkan siapa yang akan dikirimi, tanpa mengirim.
Tanpa `dry=1` pesan benar-benar dikirim. Di Vercel → Logs / Cron Jobs ada tombol "Run".

## Catatan
- Paket gratis (Hobby) Vercel hanya mengizinkan cron 1x sehari; jadwal sudah diset sekali sehari.
- Pesan dikirim ke lisensi aktif yang tanggal berakhirnya (zona WIB) jatuh besok.
- Lisensi yang sudah diingatkan ditandai di Firestore (field `remindedExp`); kalau aturan
  keamanan Firestore menolak field itu, pengiriman tetap jalan dan tidak akan terkirim ganda
  karena setiap lisensi hanya cocok dengan satu hari.
- Fonnte memakai WhatsApp biasa lewat QR (bukan API resmi Meta); ada risiko nomor dibatasi
  bila dipakai untuk pesan massal. Jaga volume wajar. Cek biaya paket di fonnte.com.
- Tombol manual "Ingatkan WA (H-1)" di aplikasi tetap bisa dipakai sebagai cadangan.
