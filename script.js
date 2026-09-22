const STORAGE_KEY = 'stokTokoKelontongData';

const dataDefault = {
  barang: [
    { id: 'beras', nama: 'Beras', kategori: 'Sembako', satuan: 'kg', hargaBeli: 9000, hargaJual: 12000, stok: 30, stokMinimum: 10 },
    { id: 'gula-pasir', nama: 'Gula Pasir', kategori: 'Sembako', satuan: 'kg', hargaBeli: 12000, hargaJual: 16000, stok: 18, stokMinimum: 8 },
    { id: 'minyak-goreng', nama: 'Minyak Goreng', kategori: 'Sembako', satuan: 'liter', hargaBeli: 15000, hargaJual: 18000, stok: 12, stokMinimum: 6 },
    { id: 'mie-instan', nama: 'Mie Instan', kategori: 'Snack', satuan: 'bungkus', hargaBeli: 2500, hargaJual: 3500, stok: 40, stokMinimum: 12 },
    { id: 'teh-celup', nama: 'Teh Celup', kategori: 'Minuman', satuan: 'bungkus', hargaBeli: 3000, hargaJual: 5000, stok: 25, stokMinimum: 10 },
    { id: 'sabun-mandi', nama: 'Sabun Mandi', kategori: 'Kebersihan', satuan: 'pcs', hargaBeli: 4500, hargaJual: 7000, stok: 14, stokMinimum: 5 },
    { id: 'air-mineral-galon', nama: 'Air Mineral Galon', kategori: 'Minuman', satuan: 'dus', hargaBeli: 18000, hargaJual: 25000, stok: 8, stokMinimum: 3 }
  ],
  transaksi: [],
  keuangan: {
    totalPemasukan: 0,
    totalPengeluaran: 0,
    keuntunganBersih: 0,
    tanggalResetHarian: null
  }
};

let dataBarang = [];
let dataTransaksi = [];
let dataKeuangan = { ...dataDefault.keuangan };
let editModeId = null;

// ========== Custom Notification System ==========
function showNotification(message, type = 'success', duration = 3000) {
  const container = document.getElementById('notificationContainer');
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icon = document.createElement('div');
  icon.className = 'notification-icon';
  
  const content = document.createElement('div');
  content.className = 'notification-content';
  content.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'notification-close';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 300);
  };
  
  notification.appendChild(icon);
  notification.appendChild(content);
  notification.appendChild(closeBtn);
  container.appendChild(notification);
  
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ambilData() {
  const dataJSON = localStorage.getItem(STORAGE_KEY);

  if (!dataJSON) {
    simpanDataAwal();
    return;
  }

  try {
    const data = JSON.parse(dataJSON);
    dataBarang = Array.isArray(data.barang) ? data.barang.map(normalisasiBarang) : dataDefault.barang.map(normalisasiBarang);
    dataTransaksi = Array.isArray(data.transaksi) ? data.transaksi.map(normalisasiTransaksi) : [];
    dataKeuangan = {
      totalPemasukan: Number(data.keuangan?.totalPemasukan) || 0,
      totalPengeluaran: Number(data.keuangan?.totalPengeluaran) || 0,
      keuntunganBersih: Number(data.keuangan?.keuntunganBersih) || 0,
      tanggalResetHarian: data.keuangan?.tanggalResetHarian || null
    };
  } catch (error) {
    console.log('Data localStorage rusak, akan dibuat ulang.', error);
    simpanDataAwal();
  }
}

function normalisasiBarang(barang) {
  return {
    id: barang.id || `barang-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nama: barang.nama || 'Barang tanpa nama',
    kategori: barang.kategori || 'Lainnya',
    satuan: barang.satuan || 'pcs',
    hargaBeli: Number(barang.hargaBeli) || 0,
    hargaJual: Number(barang.hargaJual) || 0,
    stok: Number(barang.stok) || 0,
    stokMinimum: Number(barang.stokMinimum) || 0
  };
}

function normalisasiTransaksi(transaksi) {
  const jenis = transaksi.jenis === 'masuk' ? 'masuk' : 'terjual';
  const jumlah = Number(transaksi.jumlah) || 0;
  const hargaSatuan = Number(transaksi.hargaSatuan) || 0;

  return {
    id: transaksi.id || `trx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kategori: transaksi.kategori || 'Lainnya',
    jenis,
    nama: transaksi.nama || 'Barang',
    tanggal: transaksi.tanggal || tanggalHariIni(),
    waktu: transaksi.waktu || '00:00:00',
    jumlah,
    hargaSatuan,
    total: Number(transaksi.total) || (hargaSatuan * jumlah)
  };
}

function simpanDataAwal() {
  const payload = {
    barang: dataDefault.barang.map(normalisasiBarang),
    transaksi: [],
    keuangan: { ...dataDefault.keuangan }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  dataBarang = payload.barang;
  dataTransaksi = payload.transaksi;
  dataKeuangan = { ...payload.keuangan };
}

function simpanData() {
  const payload = {
    barang: dataBarang,
    transaksi: dataTransaksi,
    keuangan: dataKeuangan
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function formatRupiah(nilai) {
  const angka = Number(nilai) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
}

function tanggalHariIni() {
  const tanggal = new Date();
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
  const hari = String(tanggal.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${hari}`;
}

function waktuSekarang() {
  const tanggal = new Date();
  const jam = String(tanggal.getHours()).padStart(2, '0');
  const menit = String(tanggal.getMinutes()).padStart(2, '0');
  const detik = String(tanggal.getSeconds()).padStart(2, '0');
  return `${jam}:${menit}:${detik}`;
}

function formatTanggalWaktu(tanggal, waktu) {
  const dateObj = new Date(`${tanggal}T${waktu || '00:00:00'}`);

  if (Number.isNaN(dateObj.getTime())) {
    return tanggal;
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

function validasiJumlah(nilai) {
  const angka = Number(nilai);
  return Number.isFinite(angka) && angka > 0;
}

function validasiBarangInput({ nama, hargaBeli, hargaJual, stok, stokMinimum }) {
  if (!nama || !nama.trim()) {
    return 'Nama barang wajib diisi.';
  }

  if (!Number.isFinite(Number(hargaBeli)) || Number(hargaBeli) < 0) {
    return 'Harga beli tidak boleh kosong dan harus 0 atau lebih.';
  }

  if (!Number.isFinite(Number(hargaJual)) || Number(hargaJual) < 0) {
    return 'Harga jual tidak boleh kosong dan harus 0 atau lebih.';
  }

  if (!Number.isFinite(Number(stok)) || Number(stok) < 0) {
    return 'Stok tidak boleh kosong dan harus 0 atau lebih.';
  }

  if (!Number.isFinite(Number(stokMinimum)) || Number(stokMinimum) < 0) {
    return 'Stok minimum tidak boleh kosong dan harus 0 atau lebih.';
  }

  return '';
}

function updateRingkasan() {
  document.getElementById('totalPemasukan').textContent = formatRupiah(dataKeuangan.totalPemasukan);
  document.getElementById('totalPengeluaran').textContent = formatRupiah(dataKeuangan.totalPengeluaran);
  document.getElementById('keuntunganBersih').textContent = formatRupiah(dataKeuangan.keuntunganBersih);
}

function hitungStokMenipis() {
  return dataBarang.filter((item) => item.stok <= item.stokMinimum).length;
}

function cekResetHarian() {
  // Reset harian otomatis untuk total pemasukan dan pengeluaran.
  // Jika hari ini berbeda dari tanggal terakhir reset, nilai harian di-reset ke 0,
  // tetapi keuntungan bersih tetap dipertahankan karena merupakan akumulasi historis.
  const hariIni = tanggalHariIni();

  if (!dataKeuangan.tanggalResetHarian || dataKeuangan.tanggalResetHarian !== hariIni) {
    dataKeuangan.totalPemasukan = 0;
    dataKeuangan.totalPengeluaran = 0;
    dataKeuangan.tanggalResetHarian = hariIni;
    simpanData();
  }
}

function hitungWaktuKesistem23_59() {
  // Menghitung berapa milidetik sampai pukul 23:59:00
  const sekarang = new Date();
  const target = new Date();
  target.setHours(23, 59, 0, 0);

  // Jika sudah lewat 23:59 hari ini, hitung untuk 23:59 besok
  if (sekarang >= target) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - sekarang.getTime();
}

function jadwalResetHarian() {
  // Menjadwalkan reset otomatis setiap hari pada pukul 23:59
  const waktuTunggu = hitungWaktuKesistem23_59();

  setTimeout(() => {
    // Lakukan reset
    const hariIni = tanggalHariIni();
    dataKeuangan.totalPemasukan = 0;
    dataKeuangan.totalPengeluaran = 0;
    dataKeuangan.tanggalResetHarian = hariIni;
    simpanData();
    updateRingkasan();
    console.log(`Reset otomatis berhasil pada ${hariIni} pukul 23:59`);

    // Jadwalkan reset untuk hari berikutnya
    jadwalResetHarian();
  }, waktuTunggu);
}

function resetDataKeuanganUntukTes() {
  // Nilai keuangan dikembalikan ke nol agar dashboard siap digunakan dalam kondisi normal.
  dataKeuangan.totalPemasukan = 0;
  dataKeuangan.totalPengeluaran = 0;
  dataKeuangan.keuntunganBersih = 0;
  dataKeuangan.tanggalResetHarian = tanggalHariIni();
  simpanData();
  updateRingkasan();
}

function resetKeuntunganBersih() {
  // Reset manual hanya untuk keuntungan bersih. Tindakan ini dibuat dengan konfirmasi
  // tambahan untuk mencegah reset yang tidak disengaja oleh pengguna.
  const konfirmasi = confirm('Apakah Anda yakin ingin mereset keuntungan bersih?');

  if (!konfirmasi) {
    return;
  }

  const inputPengguna = prompt('Ketik "RESET KEUNTUNGAN" untuk melanjutkan:', '');

  if (inputPengguna !== 'RESET KEUNTUNGAN') {
    showNotification('Reset dibatalkan.', 'warning');
    return;
  }

  dataKeuangan.keuntunganBersih = 0;
  simpanData();
  updateRingkasan();
  showNotification('Keuntungan bersih berhasil direset.', 'success');
}

function getBarangDipilih() {
  const kataKunci = document.getElementById('pencarianBarang')?.value.toLowerCase().trim() || '';
  const filterKategori = document.getElementById('filterKategori')?.value || 'semua';

  return dataBarang.filter((item) => {
    const cocokCari = item.nama.toLowerCase().includes(kataKunci);
    const cocokKategori = filterKategori === 'semua' || item.kategori === filterKategori;
    return cocokCari && cocokKategori;
  });
}

function renderBarangRow(item) {
  const isLowStock = item.stok <= item.stokMinimum;
  const rowClass = item.stok === 0 ? 'baris-merah' : isLowStock ? 'baris-kuning' : '';
  const indicatorClass = item.stok === 0 ? 'danger' : 'warning';

  if (editModeId === item.id) {
    return `
      <tr class="${rowClass} edit-row" data-id="${item.id}">
        <td class="edit-cell">
          <input type="text" value="${escapeHtml(item.nama)}" data-field="nama" />
        </td>
        <td class="edit-cell">
          <select data-field="kategori">
            ${['Sembako', 'Minuman', 'Snack', 'Kebersihan', 'Lainnya'].map((kategori) => `
              <option value="${kategori}" ${item.kategori === kategori ? 'selected' : ''}>${kategori}</option>
            `).join('')}
          </select>
        </td>
        <td class="edit-cell">
          <input type="number" min="0" value="${item.stok}" data-field="stok" />
        </td>
        <td class="edit-cell">
          <input type="text" value="${escapeHtml(item.satuan)}" data-field="satuan" />
        </td>
        <td class="edit-cell">
          <input type="number" min="0" step="100" value="${item.hargaBeli}" data-field="hargaBeli" />
        </td>
        <td class="edit-cell">
          <input type="number" min="0" step="100" value="${item.hargaJual}" data-field="hargaJual" />
        </td>
        <td class="edit-cell">
          <input type="number" min="0" value="${item.stokMinimum}" data-field="stokMinimum" />
        </td>
        <td>
          <div class="aksi-group compact">
            <button type="button" class="btn btn-success" data-aksi="save-edit" data-id="${item.id}">Simpan</button>
            <button type="button" class="btn btn-secondary" data-aksi="cancel-edit" data-id="${item.id}">Batal</button>
          </div>
        </td>
      </tr>
    `;
  }

  return `
    <tr class="${rowClass}" data-id="${item.id}">
      <td>${escapeHtml(item.nama)}</td>
      <td>${escapeHtml(item.kategori)}</td>
      <td>
        ${item.stok <= item.stokMinimum ? `<span class="stock-indicator ${indicatorClass}">${item.stok}</span>` : item.stok}
      </td>
      <td>${escapeHtml(item.satuan)}</td>
      <td>${formatRupiah(item.hargaBeli)}</td>
      <td>${formatRupiah(item.hargaJual)}</td>
      <td>${item.stokMinimum}</td>
      <td>
        <div class="aksi-group">
          <button type="button" class="btn btn-warning" data-aksi="edit" data-id="${item.id}">Edit</button>
          <button type="button" class="btn btn-success" data-aksi="masuk" data-id="${item.id}">Masuk</button>
          <button type="button" class="btn btn-danger" data-aksi="terjual" data-id="${item.id}">Terjual</button>
          <button type="button" class="btn btn-secondary" data-aksi="hapus" data-id="${item.id}">Hapus</button>
        </div>
      </td>
    </tr>
  `;
}

function tampilkanTabel() {
  const daftarBarang = getBarangDipilih();
  const tbody = document.getElementById('tabelBarang');

  if (daftarBarang.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Barang tidak ditemukan.</td></tr>';
    return;
  }

  tbody.innerHTML = daftarBarang.map(renderBarangRow).join('');
}

function sortTransactions(itemA, itemB, field, direction) {
  const faktor = direction === 'asc' ? 1 : -1;

  if (field === 'nama') {
    return String(itemA.nama).localeCompare(String(itemB.nama)) * faktor;
  }

  if (field === 'kategori') {
    return String(itemA.kategori).localeCompare(String(itemB.kategori)) * faktor;
  }

  const timeA = new Date(`${itemA.tanggal}T${itemA.waktu || '00:00:00'}`).getTime();
  const timeB = new Date(`${itemB.tanggal}T${itemB.waktu || '00:00:00'}`).getTime();
  return (timeA - timeB) * faktor;
}

function getSortedTransactions() {
  const jenisFilter = document.getElementById('filterHistoryJenis')?.value || 'semua';
  const kategoriFilter = document.getElementById('filterHistoryKategori')?.value || 'semua';
  const namaFilter = document.getElementById('filterHistoryNama')?.value.trim().toLowerCase() || '';
  const sortField = document.getElementById('sortHistoryField')?.value || 'tanggal';
  const sortDirection = document.getElementById('sortHistoryDirection')?.value || 'desc';

  const daftarTransaksi = dataTransaksi.filter((transaksi) => {
    const cocokJenis = jenisFilter === 'semua' || transaksi.jenis === jenisFilter;
    const cocokKategori = kategoriFilter === 'semua' || transaksi.kategori === kategoriFilter;
    const cocokNama = !namaFilter || transaksi.nama.toLowerCase().includes(namaFilter);
    return cocokJenis && cocokKategori && cocokNama;
  });

  return daftarTransaksi.sort((a, b) => sortTransactions(a, b, sortField, sortDirection));
}

function tampilkanRiwayat() {
  const tbody = document.getElementById('tabelRiwayat');
  const daftarTransaksi = getSortedTransactions();

  if (daftarTransaksi.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Belum ada transaksi.</td></tr>';
    return;
  }

  tbody.innerHTML = daftarTransaksi.map((transaksi) => {
    const jenis = transaksi.jenis === 'masuk' ? 'Masuk' : 'Keluar';
    const badgeClass = transaksi.jenis === 'masuk' ? 'in' : 'out';
    const total = Number(transaksi.total) || Number(transaksi.hargaSatuan || 0) * Number(transaksi.jumlah || 0);

    return `
      <tr>
        <td>${escapeHtml(transaksi.kategori || 'Lainnya')}</td>
        <td><span class="badge ${badgeClass}">${jenis}</span></td>
        <td>${escapeHtml(transaksi.nama)}</td>
        <td>${formatTanggalWaktu(transaksi.tanggal, transaksi.waktu)}</td>
        <td>${transaksi.jumlah}</td>
        <td>${formatRupiah(transaksi.hargaSatuan || 0)}</td>
        <td>${formatRupiah(total)}</td>
      </tr>
    `;
  }).join('');
}

function tambahBarang(event) {
  event.preventDefault();

  const nama = document.getElementById('namaBarang').value.trim();
  const kategori = document.getElementById('kategoriBarang').value;
  const satuan = document.getElementById('satuanBarang').value;
  const hargaBeli = Number(document.getElementById('hargaBeliBarang').value);
  const hargaJual = Number(document.getElementById('hargaJualBarang').value);
  const stokAwal = Number(document.getElementById('stokAwalBarang').value);
  const stokMinimum = Number(document.getElementById('stokMinimumBarang').value);

  const pesanValidasi = validasiBarangInput({ nama, hargaBeli, hargaJual, stok: stokAwal, stokMinimum });

  if (pesanValidasi) {
    showNotification(pesanValidasi, 'error');
    return;
  }

  const barangBaru = {
    id: `barang-${Date.now()}`,
    nama,
    kategori,
    satuan,
    hargaBeli,
    hargaJual,
    stok: stokAwal,
    stokMinimum
  };

  dataBarang.push(barangBaru);

  // Ketika stok awal dibeli, sistem menganggap toko mengeluarkan uang untuk pembelian stok tersebut.
  if (stokAwal > 0) {
    const totalPembelianAwal = hargaBeli * stokAwal;
    dataKeuangan.totalPengeluaran -= totalPembelianAwal;
    dataKeuangan.keuntunganBersih -= totalPembelianAwal;

    dataTransaksi.unshift({
      id: `trx-${Date.now()}`,
      kategori,
      jenis: 'masuk',
      nama,
      tanggal: tanggalHariIni(),
      waktu: waktuSekarang(),
      jumlah: stokAwal,
      hargaSatuan: hargaBeli,
      total: totalPembelianAwal
    });
  }

  simpanData();
  tampilkanTabel();
  updateRingkasan();
  tampilkanRiwayat();
  showNotification(`Stok ${nama} berhasil ditambahkan.`, 'success');
  event.target.reset();
  document.getElementById('namaBarang').focus();
}

function barangMasuk(idBarang) {
  const item = dataBarang.find((barang) => barang.id === idBarang);

  if (!item) {
    return;
  }

  const jumlahMasuk = prompt(`Masukkan jumlah barang masuk untuk ${item.nama}:`, '1');

  if (jumlahMasuk === null) {
    return;
  }

  if (!validasiJumlah(jumlahMasuk)) {
    showNotification('Jumlah masuk harus angka positif.', 'error');
    return;
  }

  const jumlah = Number(jumlahMasuk);
  const hargaBeli = Number(item.hargaBeli) || 0;
  const totalBiaya = hargaBeli * jumlah;

  item.stok += jumlah;

  const details = {
    id: `trx-${Date.now()}`,
    kategori: item.kategori,
    jenis: 'masuk',
    nama: item.nama,
    tanggal: tanggalHariIni(),
    waktu: waktuSekarang(),
    jumlah,
    hargaSatuan: hargaBeli,
    total: totalBiaya
  };

  dataTransaksi.unshift(details);
  dataKeuangan.totalPengeluaran -= totalBiaya;
  dataKeuangan.keuntunganBersih -= totalBiaya;
  simpanData();
  tampilkanTabel();
  updateRingkasan();
  tampilkanRiwayat();
}

function barangTerjual(idBarang) {
  const item = dataBarang.find((barang) => barang.id === idBarang);

  if (!item) {
    return;
  }

  const jumlahTerjual = prompt(`Masukkan jumlah barang terjual untuk ${item.nama}:`, '1');

  if (jumlahTerjual === null) {
    return;
  }

  if (!validasiJumlah(jumlahTerjual)) {
    showNotification('Jumlah terjual harus angka positif.', 'error');
    return;
  }

  const jumlah = Number(jumlahTerjual);

  if (jumlah > item.stok) {
    showNotification('Jumlah terjual tidak boleh melebihi stok yang tersedia.', 'error');
    return;
  }

  const hargaJual = Number(item.hargaJual) || 0;
  const totalPemasukan = hargaJual * jumlah;

  item.stok -= jumlah;

  const details = {
    id: `trx-${Date.now()}`,
    kategori: item.kategori,
    jenis: 'terjual',
    nama: item.nama,
    tanggal: tanggalHariIni(),
    waktu: waktuSekarang(),
    jumlah,
    hargaSatuan: hargaJual,
    total: totalPemasukan
  };

  dataTransaksi.unshift(details);
  dataKeuangan.totalPemasukan += totalPemasukan;
  dataKeuangan.keuntunganBersih += totalPemasukan;
  simpanData();
  tampilkanTabel();
  updateRingkasan();
  tampilkanRiwayat();
}

function hapusBarang(idBarang) {
  const item = dataBarang.find((barang) => barang.id === idBarang);

  if (!item) {
    return;
  }

  const konfirmasi = confirm(`Yakin ingin menghapus ${item.nama} dari daftar stok?`);

  if (!konfirmasi) {
    return;
  }

  dataBarang = dataBarang.filter((barang) => barang.id !== idBarang);
  simpanData();
  tampilkanTabel();
  updateRingkasan();
  tampilkanRiwayat();
}

function mulaiEdit(idBarang) {
  editModeId = idBarang;
  tampilkanTabel();
}

function batalkanEdit() {
  editModeId = null;
  tampilkanTabel();
}

function simpanEdit(idBarang) {
  const row = document.querySelector(`tr[data-id="${idBarang}"]`);

  if (!row) {
    return;
  }

  const item = dataBarang.find((barang) => barang.id === idBarang);

  if (!item) {
    return;
  }

  const updated = {
    nama: row.querySelector('[data-field="nama"]').value.trim(),
    kategori: row.querySelector('[data-field="kategori"]').value,
    stok: Number(row.querySelector('[data-field="stok"]').value),
    satuan: row.querySelector('[data-field="satuan"]').value.trim() || 'pcs',
    hargaBeli: Number(row.querySelector('[data-field="hargaBeli"]').value),
    hargaJual: Number(row.querySelector('[data-field="hargaJual"]').value),
    stokMinimum: Number(row.querySelector('[data-field="stokMinimum"]').value)
  };

  const pesanValidasi = validasiBarangInput(updated);

  if (pesanValidasi) {
    showNotification(pesanValidasi, 'error');
    return;
  }

  Object.assign(item, updated);
  editModeId = null;
  simpanData();
  tampilkanTabel();
  updateRingkasan();
  tampilkanRiwayat();
}

function aktifkanTab(targetId) {
  document.querySelectorAll('.nav-tab').forEach((button) => {
    const aktif = button.dataset.target === targetId;
    button.classList.toggle('active', aktif);
  });

  document.querySelectorAll('.page-section').forEach((section) => {
    section.classList.toggle('active', section.id === targetId);
  });
}

function inisialisasiHalaman() {
  ambilData();
  cekResetHarian();
  jadwalResetHarian();
  tampilkanTabel();
  updateRingkasan();
  tampilkanRiwayat();

  document.getElementById('formBarang').addEventListener('submit', tambahBarang);
  document.getElementById('pencarianBarang').addEventListener('input', tampilkanTabel);
  document.getElementById('filterKategori').addEventListener('change', tampilkanTabel);
  document.getElementById('filterHistoryJenis').addEventListener('change', tampilkanRiwayat);
  document.getElementById('filterHistoryKategori').addEventListener('change', tampilkanRiwayat);
  document.getElementById('filterHistoryNama').addEventListener('input', tampilkanRiwayat);
  document.getElementById('sortHistoryField').addEventListener('change', tampilkanRiwayat);
  document.getElementById('sortHistoryDirection').addEventListener('change', tampilkanRiwayat);

  document.querySelectorAll('.nav-tab').forEach((button) => {
    button.addEventListener('click', () => aktifkanTab(button.dataset.target));
  });

  document.addEventListener('click', (event) => {
    const tombol = event.target.closest('button');

    if (!tombol) {
      return;
    }

    const aksi = tombol.dataset.aksi;
    const idBarang = tombol.dataset.id;

    if (aksi === 'masuk') {
      barangMasuk(idBarang);
    }

    if (aksi === 'terjual') {
      barangTerjual(idBarang);
    }

    if (aksi === 'hapus') {
      hapusBarang(idBarang);
    }

    if (aksi === 'edit') {
      mulaiEdit(idBarang);
    }

    if (aksi === 'cancel-edit') {
      batalkanEdit();
    }

    if (aksi === 'save-edit') {
      simpanEdit(idBarang);
    }

    if (aksi === 'reset-keuntungan-bersih') {
      resetKeuntunganBersih();
    }
  });
}

inisialisasiHalaman();
