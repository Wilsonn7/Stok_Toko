# Stok Toko Kelontong

Aplikasi web sederhana untuk mencatat stok barang di toko kelontong kecil. Data disimpan di `localStorage` sehingga data tetap tersimpan di browser tanpa perlu database.

## Fitur utama
- Tambah barang baru dengan nama, kategori, satuan, harga jual, stok awal, dan stok minimum.
- Tabel daftar barang dengan status warna:
  - kuning jika stok sudah <= stok minimum
  - merah jika stok 0
- Tombol Masuk dan Terjual untuk menambah atau mengurangi stok.
- Validasi jumlah input agar angka positif dan tidak melebihi stok yang ada.
- Hapus barang dengan konfirmasi.
- Riwayat transaksi masuk dan terjual.
- Pencarian nama barang dan filter kategori.
- Ringkasan stok dan total penjualan hari ini.

## Cara menjalankan
1. Buka file `index.html` di browser.
2. Atau jalankan server lokal sederhana dengan perintah berikut:

   ```bash
   cd "d:/Web Stok Toko"
   python -m http.server 8000
   ```

3. Buka browser ke `http://localhost:8000`.

## Struktur file
- `index.html` : tampilan halaman
- `style.css` : desain dan responsif untuk HP
- `script.js` : logika aplikasi dan penyimpanan data
- `README.md` : panduan singkat

## Catatan
Aplikasi ini dibuat dengan HTML, CSS, dan JavaScript vanilla tanpa framework atau library.
