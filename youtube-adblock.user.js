// ==UserScript==
// @name         Brave-Style YouTube Adblock
// @namespace    https://github.com/Unknows05/Brave-StyleYouTubeAdblock
// @version      2.5.0
// @description  Silent Engine - FIX BLANK SCREEN by high-speed ad skipping instead of hard blocking
// @author       Unknows05 & Gemini AI
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. SILENT SKIPPER ENGINE (Solusi Layar Blank)
    // Daripada memblokir request (yang bikin YouTube marah), kita biarkan iklan lewat 
    // tapi kita selesaikan dalam waktu 100ms.
    const runSilentSkipper = () => {
        const skipLogic = () => {
            const video = document.querySelector('video');
            const adContainer = document.querySelector('.ad-showing, .ytp-ad-player-overlay');
            const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');

            if (adContainer && video) {
                // Sembunyikan elemen iklan secara visual agar tidak berkedip
                adContainer.style.opacity = "0";
                
                // Matikan suara iklan
                video.muted = true;

                // Teknik "Time Warp": Loncat ke akhir iklan & percepat speed
                if (isFinite(video.duration) && video.duration > 0) {
                    video.playbackRate = 16; // Kecepatan maksimal
                    video.currentTime = video.duration - 0.1;
                }

                // Klik tombol skip jika sudah muncul
                if (skipBtn) skipBtn.click();
            }
        };

        // Gunakan requestAnimationFrame agar lebih smooth dan tidak membebani CPU
        const loop = () => {
            skipLogic();
            requestAnimationFrame(loop);
        };
        loop();
    };

    // 2. DOM CLEANER (Hapus Iklan Banner Saja)
    const cleanBannerAds = () => {
        const style = document.createElement('style');
        style.textContent = `
            ytd-ad-slot-renderer, #masthead-ad, .ytp-ad-overlay-container,
            #player-ads, ytd-promoted-sparkles-web-renderer,
            ytd-enforcement-message-view-model, tp-yt-iron-overlay-backdrop {
                display: none !important;
            }
            /* Paksa Player tetap muncul */
            ytd-watch-flexy, #player, #player-container {
                display: block !important;
                visibility: visible !important;
            }
        `;
        document.documentElement.appendChild(style);
    };

    // 3. ANTI-SPOOFING (Brave Native Trick)
    const applyBraveSpoof = () => {
        // Tipu YouTube agar mengira kita tidak pakai adblock
        try {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            window.yt_adblock_detected = false;
        } catch(e) {}
    };

    // EKSEKUSI
    cleanBannerAds();
    applyBraveSpoof();
    
    // Tunggu player siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runSilentSkipper);
    } else {
        runSilentSkipper();
    }

    console.log('🛡️ Brave-Style v2.5.0: Silent Engine Active');
})();
