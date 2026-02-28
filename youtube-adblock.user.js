// ==UserScript==
// @name         Brave-Style YouTube Adblock
// @namespace    https://github.com/Unknows05/Brave-StyleYouTubeAdblock
// @version      2.3.0
// @description  Bypass Anti-Adblock tanpa merusak fungsi Pause/Play (Brave Mimic)
// @author       Unknows05
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js
// @downloadURL  https://raw.githubusercontent.com/Unknows05/Brave-StyleYouTubeAdblock/main/youtube-adblock.user.js
// ==/UserScript==

(function() {
    'use strict';

    const blockAdsNetwork = () => {
        const adPatterns = /googleads|doubleclick|adservice|pagead/i;
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            let url = typeof input === 'string' ? input : input.url;
            if (adPatterns.test(url)) {
                return Promise.reject(new TypeError('Blocked by Brave-Style Shield'));
            }
            return originalFetch.apply(this, arguments);
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && adPatterns.test(url)) {
                return;
            }
            return originalOpen.apply(this, arguments);
        };
    };

    const handleAdsOnly = () => {
        const observer = new MutationObserver(() => {
            const video = document.querySelector('video');
            const adShowing = document.querySelector('.ad-showing');

            if (adShowing && video) {
                video.muted = true;
                if (isFinite(video.duration)) {
                    video.currentTime = video.duration - 0.1;
                }
                video.play().catch(() => {});
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    };

    const spoofBrave = () => {
        Object.defineProperty(window, 'yt_adblock_detected', { get: () => false, configurable: true });
        const style = document.createElement('style');
        style.textContent = `
            ytd-ad-slot-renderer, #masthead-ad, .ytp-ad-overlay-container,
            tp-yt-iron-overlay-backdrop, ytd-enforcement-message-view-model,
            yt-mealbar-promo-renderer {
                display: none !important;
            }
        `;
        document.documentElement.appendChild(style);
    };

    blockAdsNetwork();
    spoofBrave();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleAdsOnly);
    } else {
        handleAdsOnly();
    }
})();
