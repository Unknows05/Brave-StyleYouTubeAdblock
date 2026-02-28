# 🛡️ Brave-Style YouTube Adblock (v2.4.0)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-orange)](https://www.tampermonkey.net/)
[![Brave Engine](https://img.shields.io/badge/Engine-Brave%20Shields%20Mimic-lion)](https://brave.com/)

Script pemblokir iklan YouTube **Multi-Layer**, dirancang khusus untuk meniru metode kerja **Brave Shields** secara native di dalam browser melalui Userscript.

---

## 🚀 Install Sekarang

[![Install](https://img.shields.io/badge/Install%20Script-🛡️%20Tampermonkey-brightgreen?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js)

> **Catatan:** Klik tombol di atas untuk langsung diarahkan ke halaman instalasi otomatis Tampermonkey.

---

## 🛠️ Fitur Utama (Brave-Logic)

Berbeda dengan adblocker biasa, script ini bekerja di 4 lapisan perlindungan:

1.  **Network Shield (Layer 1):** Memutuskan koneksi iklan di level jaringan (Fetch/XHR) sebelum data iklan sempat masuk ke browser.
2.  **DOM Filtering (Layer 2):** Pembersihan elemen visual iklan (banner, sidebar, sponsored cards) secara instan menggunakan MutationObserver.
3.  **Ad-Skip Engine (Layer 3):** Mempercepat durasi iklan secara otomatis jika sistem injeksi gagal, memastikan transisi video yang mulus.
4.  **Anti-Adblock Bypass (Layer 4):** Mengelabui variabel internal YouTube (`yt_adblock_detected`) agar kamu tidak terkena blokir popup "Adblockers are not allowed".

---

## 📋 Cara Instalasi Manual

1.  Install extension [Tampermonkey](https://www.tampermonkey.net/) atau [Violentmonkey](https://violentmonkey.github.io/).
2.  Klik tombol **Install Script** berwarna hijau di atas ☝️.
3.  Klik tombol **"Install"** atau **"Update"** pada jendela popup Tampermonkey yang muncul.
4.  **Selesai!** Buka YouTube dan nikmati tontonan tanpa gangguan iklan.

---

## 🔄 Sistem Auto-Update

Script ini dikonfigurasi untuk **Update Otomatis**. Setiap kali ada perubahan algoritma dari YouTube, saya akan melakukan pembaruan di repositori ini, dan Tampermonkey kamu akan otomatis mendownload versi terbaru di latar belakang tanpa perlu install ulang.

---

## ⚠️ Perbaikan Bug Terkini (v2.3.0)

* **Fixed Manual Pause:** Sekarang kamu bisa menekan tombol *Pause* tanpa video berputar sendiri secara otomatis.
* **Fixed Blank Screen:** Mencegah layar video menjadi hitam/kosong saat iklan diblokir.
* **Anti-Enforcement:** Menghilangkan pesan peringatan adblock terbaru dari YouTube secara permanen.

---

## 📜 Lisensi & Edukasi

Proyek ini dilisensikan di bawah **MIT License**. Gunakan dengan bijak. Script ini dibuat untuk tujuan edukasi mengenai cara kerja sistem keamanan web dan manipulasi DOM.

---
**Author:** [Unknows05](https://github.com/Unknows05)  
*Special thanks to the Brave Browser Team for the logic inspiration.*
