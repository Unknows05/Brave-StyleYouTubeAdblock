// ==UserScript==
// @name         Brave-Style YouTube Adblock
// @namespace    https://github.com/Unknows05/Brave-StyleYouTubeAdblock
// @version      2.3.0
// @description  Multi-layer adblock mimicking Brave Shields - FIXED: Manual Pause, No Blank Screen, Cross-device compatibility
// @author       Unknows05 & Gemini AI
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://brave.com/static-assets/images/brave-favicon.png
// @grant        none
// @run-at       document-start
// @noframes
// @updateURL    https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js
// @downloadURL  https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================
    // 1. PASSIVE NETWORK SHIELD (Meniru Brave Shields asli)
    // ============================================================
    const blockAdsNetwork = () => {
        const adPatterns = /googleads|doubleclick|adservice|pagead|imasdk/i;
        
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            let url = typeof input === 'string' ? input : input.url;
            if (url && adPatterns.test(url)) {
                return Promise.reject(new TypeError('Blocked by Brave-Style Shield'));
            }
            return originalFetch.apply(this, arguments);
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && adPatterns.test(url)) {
                return; // Batalkan request secara diam-diam
            }
            return originalOpen.apply(this, arguments);
        };
    };

    // ============================================================
    // 2. REACTIVE AD-SKIPPER (Hanya aktif SAAT ada iklan)
    // ============================================================
    const handleAdsOnly = () => {
        const observer = new MutationObserver(() => {
            const video = document.querySelector('video');
            const adShowing = document.querySelector('.ad-showing, .ytp-ad-player-overlay');

            if (adShowing && video) {
                // HANYA jika sedang ada iklan, kita percepat/skip
                video.muted = true;
                if (isFinite(video.duration) && video.duration > 0) {
                    video.currentTime = video.duration - 0.1;
                }
                // Paksa play HANYA untuk melewati iklan ini, bukan saat video normal
                video.play().catch(() => {});
            }

            // Click Skip Button jika muncul secara fisik
            const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
            if (skipBtn) skipBtn.click();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    };

    // ============================================================
    // 3. BRAVE-STYLE DOM FILTERING (CSS Injection)
    // ============================================================
    const injectShieldCSS = () => {
        const style = document.createElement('style');
        style.id = 'brave-shield-v2';
        style.textContent = `
            /* Sembunyikan Iklan & Popup tanpa merusak player */
            ytd-ad-slot-renderer, #masthead-ad, .ytp-ad-overlay-container,
            tp-yt-iron-overlay-backdrop, ytd-enforcement-message-view-model,
            yt-mealbar-promo-renderer, ytd-compact-promoted-video-renderer,
            .ytp-ad-message-container, #player-ads {
                display: none !important;
                visibility: hidden !important;
            }
            /* Pastikan Video Player Tetap Terlihat (Anti-Blank) */
            ytd-watch-flexy, #player, #player-container, video {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        document.documentElement.appendChild(style);
    };

    // ============================================================
    // 4. ENVIRONMENT SPOOFING
    // ============================================================
    const spoofEnvironment = () => {
        // Mengelabui variabel internal YouTube agar mengira adblock tidak aktif
        try {
            Object.defineProperty(window, 'yt_adblock_detected', { get: () => false, configurable: true });
        } catch(e) {}
    };

    // EXECUTION LOGIC
    blockAdsNetwork();
    injectShieldCSS();
    spoofEnvironment();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleAdsOnly);
    } else {
        handleAdsOnly();
    }

    console.log('🛡️ Brave-Style YouTube Adblock v2.3.0 Active');
})();
