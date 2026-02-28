// ==UserScript==
// @name         Brave-Style YouTube Adblock
// @namespace    https://github.com/Unknows05/Brave-StyleYouTubeAdblock
// @version      2.4.0
// @description  Multi-layer adblock mimicking Brave Shields - FIXED: Blank Screen Hijacking & Manual Pause
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

    // 1. RECOVERY WATCHDOG (Mencegah Layar Blank)
    // Meniru fitur "Self-Healing" pada Brave untuk elemen yang disembunyikan paksa
    const startWatchdog = () => {
        const fixDisplay = () => {
            // Target utama: Container yang sering dibuat 'hidden' oleh YouTube
            const playerSelectors = [
                '#player-container', 
                '#ytd-player', 
                '.html5-video-container', 
                'video',
                '.html5-main-video'
            ];
            
            playerSelectors.forEach(selector => {
                const el = document.querySelector(selector);
                if (el && (window.getComputedStyle(el).display === 'none' || window.getComputedStyle(el).visibility === 'hidden')) {
                    el.style.setProperty('display', 'block', 'important');
                    el.style.setProperty('visibility', 'visible', 'important');
                    el.style.setProperty('opacity', '1', 'important');
                }
            });
        };

        // Jalankan setiap 1 detik untuk memastikan player tetap "hidup"
        setInterval(fixDisplay, 1000);
    };

    // 2. NETWORK SHIELD
    const blockAdsNetwork = () => {
        const adPatterns = /googleads|doubleclick|adservice|pagead|imasdk/i;
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            let url = typeof input === 'string' ? input : input.url;
            if (url && adPatterns.test(url)) return Promise.reject(new TypeError('Shielded'));
            return originalFetch.apply(this, arguments);
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && adPatterns.test(url)) return;
            return originalOpen.apply(this, arguments);
        };
    };

    // 3. REACTIVE SKIPPER (Hanya aktif saat class ad-showing muncul)
    const handleAdsOnly = () => {
        const observer = new MutationObserver(() => {
            const video = document.querySelector('video');
            const adShowing = document.querySelector('.ad-showing, .ytp-ad-player-overlay');

            if (adShowing && video) {
                video.muted = true;
                if (isFinite(video.duration) && video.duration > 0) {
                    video.currentTime = video.duration - 0.1;
                }
                video.play().catch(() => {});
                
                // Cari tombol skip secara spesifik
                const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
                if (skipBtn) skipBtn.click();
            }
        });

        observer.observe(document.documentElement, {
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    };

    // 4. CSS REINFORCEMENT
    const injectShieldCSS = () => {
        const style = document.createElement('style');
        style.textContent = `
            ytd-ad-slot-renderer, #masthead-ad, .ytp-ad-overlay-container,
            tp-yt-iron-overlay-backdrop, ytd-enforcement-message-view-model,
            yt-mealbar-promo-renderer, #player-ads, ytd-ad-slot-renderer {
                display: none !important;
            }
            /* Mencegah player hilang saat transisi iklan ke video utama */
            .html5-video-player.ad-showing video {
                opacity: 0 !important; /* Sembunyikan iklan secara visual */
            }
            .html5-video-player:not(.ad-showing) video {
                opacity: 1 !important; /* Paksa video utama muncul */
            }
        `;
        document.documentElement.appendChild(style);
    };

    // INITIALIZE
    blockAdsNetwork();
    injectShieldCSS();
    startWatchdog(); // Jalankan penyembuh layar blank
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleAdsOnly);
    } else {
        handleAdsOnly();
    }

    console.log('🛡️ Brave-Style v2.4.0: Watchdog Active');
})();
