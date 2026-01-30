// ==UserScript==
// @name         Brave-Style YouTube Adblock
// @namespace    https://github.com/Unknows05/Brave-StyleYouTubeAdblock
// @version      1.2.4
// @description  Multi-layer adblock mimicking Brave Shields - FIXED AUTO-PLAY BUG
// @author       Unknowns05
// @license      MIT
// @copyright    2026, Unknowns05
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
    // CONFIGURATION
    // ============================================================

    const CONFIG = {
        enableNetworkBlock: true,
        enableDOMFilter: true,
        enableScriptBlock: true,
        enableAntiAdblockBypass: true,
        debug: false,
        autoUpdate: false  // DIMATIKAN: butuh GM_info dengan @grant
    };

    // ============================================================
    // STATE MANAGEMENT - Track user interaction
    // ============================================================

    let state = {
        userPaused: false,
        lastUserInteraction: 0,
        isAdShowing: false,
        videoElement: null,
        adSkipAttempted: false
    };

    const USER_INTERACTION_TIMEOUT = 5000;

    // ============================================================
    // LAYER 1: NETWORK-LEVEL BLOCKING
    // ============================================================

    function setupNetworkBlocking() {
        if (!CONFIG.enableNetworkBlock) return;

        const AD_DOMAINS = [
            'doubleclick.net',
            'googleadservices.com',
            'adservice.google',
            'pagead2.googlesyndication.com',
            'pubads.g.doubleclick.net',
            'youtube-nocookie.com',
            'imasdk.googleapis.com',
            'static.ads-twitter.com',
            'ads.youtube.com'
        ];

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string') {
                const lowerUrl = url.toLowerCase();
                for (const domain of AD_DOMAINS) {
                    if (lowerUrl.includes(domain)) {
                        if (CONFIG.debug) console.log('🛡️ [NETWORK BLOCK] Blocked:', url);
                        // FIX: Jangan return undefined, abort saja
                        this.abort();
                        return;
                    }
                }
            }
            return originalOpen.apply(this, arguments);
        };

        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            let url = typeof input === 'string' ? input : input.url;
            if (url) {
                const lowerUrl = url.toLowerCase();
                for (const domain of AD_DOMAINS) {
                    if (lowerUrl.includes(domain)) {
                        if (CONFIG.debug) console.log('🛡️ [NETWORK BLOCK] Blocked fetch:', url);
                        return Promise.reject(new Error('Ad request blocked'));
                    }
                }
            }
            return originalFetch.apply(this, arguments);
        };

        log('Layer 1: Network blocking enabled');
    }

    // ============================================================
    // LAYER 2: DOM FILTERING (CSS Injection)
    // ============================================================

    function setupDOMFiltering() {
        if (!CONFIG.enableDOMFilter) return;

        const CSS_FILTERS = `
            .ad-showing,
            .ytp-ad-player-overlay,
            .ytp-ad-text-overlay,
            .ytp-ad-module,
            .ytp-ad-overlay-container,
            .ytp-ad-progress-list,
            .ytp-ad-skip-button,
            .ytp-ad-skip-button-modern,
            .ytp-ad-skip-button-container,
            .videoAdUi,
            .videoAdUiLearnMore,
            .videoAdUiVisitAdvertiserLink,
            ytd-display-ad-renderer,
            ytd-promoted-sparkles-web-renderer,
            ytd-promoted-video-renderer,
            ytd-action-companion-ad-renderer,
            ytd-video-masthead-ad-advertiser-info-renderer,
            ytd-video-masthead-ad-primary-video-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-ad-slot-renderer,
            ytd-banner-promo-renderer,
            ytd-statement-banner-renderer,
            ytd-mealbar-promo-renderer,
            ytd-enforcement-message-view-model,
            ytd-merch-shelf-renderer,
            ytm-promoted-sparkles-web-renderer,
            ytd-compact-promoted-video-renderer,
            ytd-promoted-sparkles-text-search-renderer,
            tp-yt-iron-overlay-backdrop,
            ytd-popup-container > tp-yt-paper-dialog,
            #masthead-ad,
            #player-ads,
            .player-ads,
            .ytd-video-masthead-ad-v3-renderer,
            [data-is-sponsored],
            [data-ad-slot],
            .style-scope.ytd-enforcement-message-view-model,
            .style-scope.ytd-mealbar-promo-renderer {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                pointer-events: none !important;
            }
            ytd-watch-flexy[flexy][is-two-columns_]:not([fullscreen]) {
                --ytd-watch-flexy-player-width: calc(var(--ytd-watch-flexy-player-width) + var(--ytd-watch-flexy-sidebar-width)) !important;
            }
            .ytp-ad-loading-spinner {
                display: none !important;
            }
        `;

        const style = document.createElement('style');
        style.id = 'brave-adblock-styles';
        style.textContent = CSS_FILTERS;
        style.setAttribute('data-adblock', 'brave-style');

        if (document.head) {
            document.head.appendChild(style);
        } else {
            const observer = new MutationObserver(() => {
                if (document.head) {
                    document.head.appendChild(style);
                    observer.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }

        log('Layer 2: DOM filtering enabled');
    }

    // ============================================================
    // LAYER 3: SCRIPT BLOCKING
    // ============================================================

    function setupScriptBlocking() {
        if (!CONFIG.enableScriptBlock) return;

        const AD_SCRIPT_PATTERNS = [
            /adsbygoogle/,
            /google_ad/,
            /doubleclick/,
            /pubads/,
            /ima3/,
            /adblock/,
            /prebid/
        ];

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT') {
                        const src = node.src || node.textContent;
                        for (const pattern of AD_SCRIPT_PATTERNS) {
                            if (pattern.test(src)) {
                                node.remove();
                                if (CONFIG.debug) console.log('🛡️ [SCRIPT BLOCK] Removed:', pattern);
                                break;
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        log('Layer 3: Script blocking enabled');
    }

    // ============================================================
    // USER INTERACTION TRACKING - FIX FOR AUTO-PLAY BUG
    // ============================================================

    function setupUserInteractionTracking() {
        const getPlayerContainer = () => {
            return document.querySelector('.html5-video-player') ||
                   document.querySelector('.ytp-chrome-bottom') ||
                   document.querySelector('video');
        };

        document.addEventListener('click', (e) => {
            const playerContainer = getPlayerContainer();
            const video = document.querySelector('video');

            if (playerContainer && playerContainer.contains(e.target)) {
                state.lastUserInteraction = Date.now();

                if (video && video.paused) {
                    state.userPaused = true;
                    log('⏸️ User manually paused video', 'info');
                } else if (video && !video.paused) {
                    state.userPaused = false;
                    log('▶️ User manually played video', 'info');
                }
            }
        }, true);

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                const activeElement = document.activeElement;
                const video = document.querySelector('video');

                if (video && !['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement?.tagName)) {
                    state.lastUserInteraction = Date.now();

                    if (video.paused) {
                        state.userPaused = false;
                        log('▶️ User pressed space to play', 'info');
                    } else {
                        state.userPaused = true;
                        log('⏸️ User pressed space to pause', 'info');
                    }
                }
            }
        }, true);

        const videoObserver = new MutationObserver(() => {
            const video = document.querySelector('video');
            if (video && video !== state.videoElement) {
                state.videoElement = video;

                video.addEventListener('pause', () => {
                    if (!state.isAdShowing && !state.userPaused) {
                        const timeSinceInteraction = Date.now() - state.lastUserInteraction;
                        if (timeSinceInteraction > USER_INTERACTION_TIMEOUT) {
                            log('⏸️ Video paused (likely anti-adblock)', 'warn');
                        }
                    }
                }, { once: true });

                video.addEventListener('play', () => {
                    state.userPaused = false;
                }, { once: true });
            }
        });

        videoObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        log('User interaction tracking enabled');
    }

    // ============================================================
    // ANTI-ADBLOCK BYPASS - FIXED VERSION
    // ============================================================

    function setupAntiAdblockBypass() {
        if (!CONFIG.enableAntiAdblockBypass) return;

        setInterval(() => {
            const video = document.querySelector('video');
            if (!video) return;

            // Dismiss anti-adblock buttons
            const dismissBtn = document.querySelector('#dismiss-button, [aria-label="Close"], .ytp-ad-skip-button');
            if (dismissBtn) {
                dismissBtn.click();
                log('Dismissed anti-adblock popup');
            }

            // Remove enforcement message
            const enforcement = document.querySelector('ytd-enforcement-message-view-model');
            if (enforcement) {
                enforcement.remove();
                log('Removed enforcement message');
            }

            // Remove overlay backdrop
            const backdrop = document.querySelector('tp-yt-iron-overlay-backdrop');
            if (backdrop) {
                backdrop.remove();
            }

            // SMART AUTO-PLAY - Only play if:
            // - Video is paused
            // - NOT paused by user (within timeout)
            // - No ad is showing
            if (video.paused && !state.userPaused) {
                const timeSinceInteraction = Date.now() - state.lastUserInteraction;
                const isRecentUserPause = timeSinceInteraction < USER_INTERACTION_TIMEOUT;

                if (!isRecentUserPause && !state.isAdShowing) {
                    video.play().then(() => {
                        log('▶️ Auto-played (anti-adblock prevention)', 'info');
                    }).catch(() => {});
                } else if (isRecentUserPause) {
                    if (CONFIG.debug) {
                        console.log('⏸️ Respecting user pause (within timeout)');
                    }
                }
            }

        }, 1000);

        log('Anti-adblock bypass enabled (with user pause protection)');
    }

    // ============================================================
    // SKIP BUTTON AUTO-CLICK
    // ============================================================

    function setupSkipButtonAutoClick() {
        const skipSelectors = [
            '.ytp-ad-skip-button',
            '.ytp-ad-skip-button-modern',
            '#skip-button:has(.ytp-ad-skip-button)',
            '.videoAdUiSkipButton'
        ];

        setInterval(() => {
            skipSelectors.forEach(selector => {
                const button = document.querySelector(selector);
                if (button && !button.disabled) {
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    button.dispatchEvent(clickEvent);
                    log('⏭️ Auto-clicked skip button');
                }
            });
        }, 300);
    }

    // ============================================================
    // AD DETECTION & HANDLING
    // ============================================================

    function setupAdDetection() {
        setInterval(() => {
            const adElement = document.querySelector('.ad-showing, .ytp-ad-player-overlay');
            const video = document.querySelector('video');

            if (adElement) {
                state.isAdShowing = true;
                state.adSkipAttempted = false;

                if (video) {
                    video.muted = true;

                    if (!state.adSkipAttempted && isFinite(video.duration)) {
                        const randomOffset = Math.random() * 0.5 + 0.1;
                        try {
                            video.currentTime = video.duration + randomOffset;
                            state.adSkipAttempted = true;
                            log('⏭️ Skipped ad by seeking to end');
                        } catch (e) {
                            if (CONFIG.debug) console.warn('Skip failed:', e);
                        }
                    }
                }
            } else {
                state.isAdShowing = false;
                state.adSkipAttempted = false;
                if (video) {
                    video.muted = false;
                }
            }
        }, 200);
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    function log(message, level = 'info') {
        if (!CONFIG.debug) return;

        const prefix = '🛡️ [Brave-Style Adblock]';
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

        switch(level) {
            case 'error':
                console.error(`${prefix} [${timestamp}] ❌ ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} [${timestamp}] ⚠️ ${message}`);
                break;
            case 'info':
            default:
                console.info(`${prefix} [${timestamp}] ℹ️ ${message}`);
        }
    }

    function initialize() {
        log('Initializing Brave-Style Adblock v1.2.4...', 'info');

        setupUserInteractionTracking();
        setupNetworkBlocking();
        setupDOMFiltering();
        setupScriptBlocking();
        setupAdDetection();
        setupAntiAdblockBypass();
        setupSkipButtonAutoClick();

        log('✅ All layers active - Enjoy ad-free YouTube!', 'info');
    }

    // ============================================================
    // START SCRIPT
    // ============================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
