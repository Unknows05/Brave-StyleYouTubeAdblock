# 🛡️ Brave-Style YouTube Adblock (v2.3.0)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-orange)](https://www.tampermonkey.net/)
[![Brave Engine](https://img.shields.io/badge/Engine-Brave%20Shields%20Mimic-lion)](https://brave.com/)

Script pemblokir iklan YouTube **Hybrid-Layer**, dirancang khusus untuk mereplikasi mekanisme **Brave Shields** secara native melalui manipulasi Network & DOM dalam ekosistem Userscript.

---

## 🚀 Install Sekarang

[![Install](https://img.shields.io/badge/Install%20Script-🛡️%20Tampermonkey-brightgreen?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js)

> **Pro Tip:** Pastikan hanya menggunakan satu script adblock di Tampermonkey untuk menghindari konflik logika.

---

## 🛠️ Arsitektur Pertahanan (Brave-Logic)

Berbeda dengan script standar, versi **v2.3.0** ini bekerja pada lapisan proteksi yang sinkron:

1.  **Passive Network Shield:** Memutus request iklan di level `Fetch` & `XHR` sebelum script iklan Google sempat dieksekusi oleh browser.
2.  **Reactive Ad-Skipper:** Menggunakan `MutationObserver` (bukan interval kasar) untuk mendeteksi iklan video secara instan tanpa membebani CPU.
3.  **Environment Spoofing:** Mengelabui integritas variabel internal YouTube (`yt_adblock_detected`) untuk mencegah pemicu popup "Adblockers are not allowed".
4.  **Static UI Filtering:** Injeksi CSS tingkat tinggi untuk membersihkan slot iklan banner, sidebar, dan *sponsored cards* secara permanen.

---

## 📋 Panduan Instalasi

1.  Pasang ekstensi [Tampermonkey](https://www.tampermonkey.net/) (Rekomendasi) atau [Violentmonkey](https://violentmonkey.github.io/).
2.  Klik tombol **Install Script** berwarna hijau di atas ☝️.
3.  Klik **"Install"** atau **"Update"** pada jendela konfirmasi yang muncul.
4.  Buka YouTube dan nikmati pengalaman menonton yang bersih.

---

## 💎 Keunggulan Stabilitas v2.3.0

Versi ini berfokus pada **User Experience** yang murni tanpa mengorbankan fungsionalitas browser:

* **True Manual Pause:** Memperbaiki bug di mana video berputar sendiri saat di-pause. Sekarang kontrol penuh ada di tangan user.
* **Anti-Blank Screen:** Logika pemblokiran jaringan yang presisi untuk mencegah player YouTube menjadi hitam/stuck.
* **Zero-Lag Engine:** Tanpa penggunaan `setInterval` yang agresif, menjaga penggunaan RAM tetap rendah.

---

## 🔄 Sistem Auto-Update

Script ini mendukung penuh **Auto-Update**. Ketika YouTube memperbarui algoritma deteksinya, repositori ini akan diperbarui dan Tampermonkey kamu akan melakukan sinkronisasi otomatis di latar belakang.

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Dibuat untuk tujuan riset mengenai keamanan web, manipulasi DOM, dan optimasi performa browser.

---
**Maintained by:** [Unknows05](https://github.com/Unknows05)  
*Special thanks to the Brave Browser logic for the technical inspiration.*
