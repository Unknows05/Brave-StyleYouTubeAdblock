// ==UserScript==
// @name         Brave-Style YouTube Adblock
// @namespace    https://github.com/Unknows05/Brave-StyleYouTubeAdblock
// @version      2.5.0
// @description  Silent Engine - Anti-Blank & Manual Pause Protection (Brave Mimic)
// @author       Unknows05 & Gemini AI
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://brave.com/static-assets/images/brave-favicon.png
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js
// @downloadURL  https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 1. INJECT SHIELD CSS (Hapus Elemen Visual)
    const injectCSS = () => {
        const style = document.createElement('style');
        style.id = 'brave-silent-css';
        style.textContent = `
            /* Sembunyikan iklan banner/sidebar tanpa merusak player */
            ytd-ad-slot-renderer, #masthead-ad, .ytp-ad-overlay-container,
            #player-ads, ytd-promoted-sparkles-web-renderer,
            ytd-enforcement-message-view-model, tp-yt-iron-overlay-backdrop,
            .ytp-ad-message-container, yt-mealbar-promo-renderer {
                display: none !important;
            }

            /* PAKSA Player Utama tetap muncul (Anti-Blank Fix) */
            ytd-watch-flexy, #player, #player-container, #ytd-player, .html5-video-container {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        document.documentElement.appendChild(style);
    };

    // 2. SILENT SKIPPER (Bypass Iklan tanpa Blank)
    const setupSilentSkipper = () => {
        const handleVideoUpdate = () => {
            const video = document.querySelector('video');
            const adShowing = document.querySelector('.ad-showing, .ytp-ad-player-overlay');
            const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');

            if (adShowing && video) {
                // Sembunyikan iklan secara visual agar tidak berkedip
                video.style.opacity = "0";
                video.muted = true;

                // Akselerasi Iklan (Menipu sistem agar mengira iklan sudah selesai)
                if (isFinite(video.duration) && video.duration > 0) {
                    video.playbackRate = 16; // Kecepatan maksimal yang didukung Chrome/Brave
                    video.currentTime = video.duration - 0.1;
                }

                // Klik tombol skip otomatis jika tersedia
                if (skipBtn) skipBtn.click();
            } else if (video && !adShowing) {
                // Kembalikan ke normal jika sudah bukan iklan
                if (video.style.opacity === "0") video.style.opacity = "1";
                if (video.playbackRate > 2) video.playbackRate = 1;
            }
        };

        // MutationObserver: Lebih efisien & tidak ganggu tombol PAUSE user
        const observer = new MutationObserver(handleVideoUpdate);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    };

    // 3. ENVIRONMENT SPOOFING (Menghilangkan Deteksi Adblock)
    const applySpoofing = () => {
        try {
            // Tipu YouTube agar mengira variabel adblock bernilai false
            Object.defineProperty(window, 'yt_adblock_detected', { get: () => false, configurable: true });
            // Sembunyikan status otomasi browser
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        } catch(e) {}
    };

    // EKSEKUSI
    injectCSS();
    applySpoofing();
    
    // Jalankan secepat mungkin
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setupSilentSkipper();
    } else {
        document.addEventListener('DOMContentLoaded', setupSilentSkipper);
    }

    console.log('🛡️ Brave-Style v2.5.0: Silent Engine Active');
})();
