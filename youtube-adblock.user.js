// ==UserScript==
// @name         Brave-Style YouTube Adblock
// @namespace    https://github.com/Unknows05/Brave-StyleYouTubeAdblock
// @version      1.2.5
// @description  Multi-layer adblock mimicking Brave Shields - FIXED AUTO-PLAY BUG v2
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

    const CONFIG = {
        enableNetworkBlock: true,
        enableDOMFilter: true,
        enableScriptBlock: true,
        enableAntiAdblockBypass: true,
        debug: false
    };

    // State yang lebih sophisticated
    const state = {
        userPaused: false,
        lastUserAction: 0,        // Timestamp aksi user terakhir
        lastPauseTime: 0,         // Kapan video terakhir di-pause
        isAdPlaying: false,
        videoElement: null,
        pauseReason: 'unknown',   // 'user', 'ad', 'anti-adblock', 'unknown'
        autoplayAttempts: 0       // Cegah infinite loop
    };

    const USER_ACTION_COOLDOWN = 3000; // 3 detik cukup untuk bedain user vs script

    // ============================================================
    // USER INTENT DETECTION SYSTEM (FIXED)
    // ============================================================
    
    function setupUserIntentTracking() {
        // Track 1: Klik spesifik pada tombol play/pause (bukan sekedar area player)
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Deteksi tombol play/pause YouTube (class spesifik)
            const isPlayButton = target.closest('.ytp-play-button, .ytp-play-button-text');
            const isVideoElement = target.tagName === 'VIDEO';
            const isPlayerControls = target.closest('.ytp-chrome-controls, .ytp-bottom');
            
            if (isPlayButton || (isPlayerControls && !isVideoElement)) {
                // User benar-benar klik tombol kontrol
                state.lastUserAction = Date.now();
                
                const video = document.querySelector('video');
                if (video) {
                    // Toggle state berdasarkan status saat ini
                    if (!video.paused) {
                        // Video sedang play, user klik = mau pause
                        state.userPaused = true;
                        state.pauseReason = 'user';
                        state.lastPauseTime = Date.now();
                        if (CONFIG.debug) console.log('🛑 USER PAUSE (button click)');
                    } else {
                        // Video sedang pause, user klik = mau play
                        state.userPaused = false;
                        state.pauseReason = 'none';
                        state.autoplayAttempts = 0;
                        if (CONFIG.debug) console.log('▶️ USER PLAY (button click)');
                    }
                }
            }
        }, true);

        // Track 2: Keyboard shortcut (Space atau K) untuk play/pause
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
                    state.lastUserAction = Date.now();
                    
                    const video = document.querySelector('video');
                    if (video) {
                        // Delay kecil biar state video ke-update dulu
                        setTimeout(() => {
                            if (video.paused) {
                                state.userPaused = true;
                                state.pauseReason = 'user';
                                state.lastPauseTime = Date.now();
                                if (CONFIG.debug) console.log('🛑 USER PAUSE (keyboard)');
                            } else {
                                state.userPaused = false;
                                state.pauseReason = 'none';
                                if (CONFIG.debug) console.log('▶️ USER PLAY (keyboard)');
                            }
                        }, 50);
                    }
                }
            }
        }, true);

        // Track 3: Observer untuk perubahan state video (backup detection)
        const videoObserver = new MutationObserver((mutations) => {
            const video = document.querySelector('video');
            if (video && video !== state.videoElement) {
                state.videoElement = video;
                attachVideoEventListeners(video);
            }
        });

        videoObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    function attachVideoEventListeners(video) {
        // Event: Pause terjadi
        video.addEventListener('pause', () => {
            state.lastPauseTime = Date.now();
            
            // Cek apakah ini pause oleh user (within cooldown)
            const timeSinceAction = Date.now() - state.lastUserAction;
            
            if (timeSinceAction < 100) {
                // Pause terjadi dalam 100ms setelah aksi user = user pause
                state.pauseReason = 'user';
                state.userPaused = true;
            } else if (timeSinceAction < USER_ACTION_COOLDOWN) {
                // Dalam window cooldown, asumsikan user pause
                state.pauseReason = 'user';
                state.userPaused = true;
            } else {
                // Diluar cooldown, kemungkinan anti-adblock atau ad
                if (state.isAdPlaying) {
                    state.pauseReason = 'ad';
                } else {
                    state.pauseReason = 'anti-adblock';
                }
            }
            
            if (CONFIG.debug) console.log(`⏸️ Video PAUSED (reason: ${state.pauseReason}, time since action: ${timeSinceAction}ms)`);
        });

        // Event: Play terjadi
        video.addEventListener('play', () => {
            state.userPaused = false;
            state.autoplayAttempts = 0;
            state.pauseReason = 'none';
            
            if (CONFIG.debug) console.log('▶️ Video PLAYING (reset states)');
        });
    }

    // ============================================================
    // ANTI-ADBLOCK BYPASS (FIXED - SMART AUTOPLAY)
    // ============================================================
    
    function setupSmartAntiAdblockBypass() {
        if (!CONFIG.enableAntiAdblockBypass) return;

        setInterval(() => {
            const video = document.querySelector('video');
            if (!video) return;

            // 1. Remove anti-adblock overlays
            document.querySelectorAll('ytd-enforcement-message-view-model, tp-yt-iron-overlay-backdrop').forEach(el => {
                el.remove();
            });

            // 2. Dismiss buttons
            const dismissBtn = document.querySelector('#dismiss-button, [aria-label="Close"]');
            if (dismissBtn) dismissBtn.click();

            // 3. SMART AUTOPLAY CHECK
            if (video.paused) {
                const timeSincePause = Date.now() - state.lastPauseTime;
                const timeSinceAction = Date.now() - state.lastUserAction;
                
                // Kondisi untuk auto-play:
                // - Video paused
                // - BUKAN user yang pause (state.userPaused = false)
                // - Sudah lewat cooldown (3 detik)
                // - Bukan karena ad playing (karena ad kita skip dengan cara lain)
                // - Limit attempts (max 3 kali) untuk safety
                
                if (!state.userPaused && 
                    timeSinceAction > USER_ACTION_COOLDOWN && 
                    timeSincePause > 1000 && // Tunggu 1 detik setelah pause
                    state.pauseReason === 'anti-adblock' &&
                    state.autoplayAttempts < 3 &&
                    !state.isAdPlaying) {
                    
                    state.autoplayAttempts++;
                    if (CONFIG.debug) console.log(`🔄 Attempting autoplay recovery (#${state.autoplayAttempts})`);
                    
                    video.play().then(() => {
                        if (CONFIG.debug) console.log('✅ Autoplay success');
                        state.autoplayAttempts = 0;
                    }).catch((err) => {
                        if (CONFIG.debug) console.warn('❌ Autoplay blocked:', err);
                    });
                }
            }

        }, 2000); // Check setiap 2 detik (tidak terlalu aggressive)
    }

    // ============================================================
    // AD DETECTION & HANDLING (IMPROVED)
    // ============================================================
    
    function setupAdHandling() {
        setInterval(() => {
            const video = document.querySelector('video');
            const adOverlay = document.querySelector('.ad-showing, .ytp-ad-player-overlay');
            
            if (adOverlay && video) {
                state.isAdPlaying = true;
                video.muted = true;
                
                // Fast forward ad
                if (isFinite(video.duration) && video.duration > 0) {
                    try {
                        video.currentTime = video.duration;
                        if (CONFIG.debug) console.log('⏭️ Ad skipped');
                    } catch(e) {}
                }
            } else {
                if (state.isAdPlaying && video) {
                    // Ad selesai
                    video.muted = false;
                    state.isAdPlaying = false;
                }
                state.isAdPlaying = false;
            }
        }, 300);
    }

    function setupSkipButtonHandler() {
        setInterval(() => {
            const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
            if (skipBtn && skipBtn.offsetParent !== null) {
                skipBtn.click();
            }
        }, 500);
    }

    // ============================================================
    // NETWORK & DOM BLOCKING (Standard)
    // ============================================================
    
    function setupNetworkBlocking() {
        if (!CONFIG.enableNetworkBlock) return;
        
        const blocked = ['doubleclick', 'googleadservices', 'adservice.google', 'pagead2'];
        const origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(m, url) {
            if (blocked.some(d => url.includes(d))) return origOpen.call(this, m, 'about:blank');
            return origOpen.apply(this, arguments);
        };
    }

    function setupDOMFiltering() {
        if (!CONFIG.enableDOMFilter) return;
        
        const css = `
            .ad-showing, .ytp-ad-player-overlay, .ytp-ad-module, 
            ytd-display-ad-renderer, ytd-enforcement-message-view-model,
            tp-yt-iron-overlay-backdrop, #masthead-ad, .ytp-ad-skip-button {
                display: none !important;
                pointer-events: none !important;
            }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================
    
    function init() {
        if (CONFIG.debug) console.log('[Brave Adblock] v1.2.5 Initializing...');
        
        setupUserIntentTracking();
        setupSmartAntiAdblockBypass();
        setupAdHandling();
        setupSkipButtonHandler();
        setupNetworkBlocking();
        setupDOMFiltering();
        
        if (CONFIG.debug) console.log('[Brave Adblock] Ready - User intent tracking active');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
