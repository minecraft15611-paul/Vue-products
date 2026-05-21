<script setup lang="ts">
import { ref, onMounted } from 'vue';

const visible    = ref(true);
const leaving    = ref(false);
const progress   = ref(0);
const barVisible = ref(true);

const FAST_DURATION  = 3000;
const SLOW_DURATION  = 20000;
const HEALTH_TIMEOUT = 1000;
const EXIT_DURATION  = 600;
const BAR_FADE       = 400;

const animateProgress = (durationMs: number) => {
    const startTime = performance.now();

    const tick = (now: number) => {
        const elapsed = now - startTime;
        progress.value = Math.min((elapsed / durationMs) * 100, 100);

        if (elapsed < durationMs) {
            requestAnimationFrame(tick);
        } else {
            // Fade bar out first, then exit the cover
            barVisible.value = false;
            setTimeout(() => {
                leaving.value = true;
                setTimeout(() => {
                    visible.value = false;
                }, EXIT_DURATION);
            }, BAR_FADE);
        }
    };

    requestAnimationFrame(tick);
};

onMounted(async () => {
    let serverAwake = false;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT);

        await fetch('https://lemontree-api.onrender.com/api/health', {
            signal: controller.signal,
            credentials: 'include',
        });

        clearTimeout(timeout);
        serverAwake = true;
    } catch {
        serverAwake = false;
    }

    animateProgress(serverAwake ? FAST_DURATION : SLOW_DURATION);
});
</script>

<template>
    <div v-if="visible" class="splash-cover" :class="{ leaving }">

        <!-- Wordmark + subtitle -->
        <div class="splash-content">
            <span class="splash-wordmark">LemonTree</span>
            <span class="splash-subtitle">Preparing your experience</span>
        </div>
  
        <!-- Ultra-thin progress bar -->
        <div class="splash-bar-track" :class="{ hidden: !barVisible }">  
            <div class="splash-bar-fill" :style="{ width: progress + '%' }" />
        </div>

    </div>
</template>

<style scoped>
/* ── Cover ─────────────────────────────────────────────────────────── */
.splash-cover {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Dark frosted glass */
    background: rgba(6, 6, 6, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    /* Exit transition */
    transition: opacity 600ms ease, transform 600ms ease;
}

.splash-cover.leaving {
    opacity: 0;
    transform: translateY(-6px);
}

/* ── Mobile: slightly darker ────────────────────────────────────────── */
@media (max-width: 768px) {
    .splash-cover {
        background: rgba(6, 6, 6, 0.88);
    }
}

/* ── Content ────────────────────────────────────────────────────────── */
.splash-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

/* ── Wordmark ───────────────────────────────────────────────────────── */
.splash-wordmark {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 300;
    letter-spacing: 0.22em;
    color: rgba(255, 255, 255, 0.92);
    text-transform: uppercase;

    /* Breathing animation */
    animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
    0%,  100% { opacity: 0.92; }
    50%        { opacity: 0.38; }
}

/* ── Subtitle ───────────────────────────────────────────────────────── */
.splash-subtitle {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 0.68rem;
    font-weight: 300;
    letter-spacing: 0.28em;
    color: rgba(255, 255, 255, 0.35);
    text-transform: uppercase;
}

/* ── Progress bar ───────────────────────────────────────────────────── */
.splash-bar-track {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1.5px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
    transition: opacity 400ms ease;
}

.splash-bar-track.hidden {
    opacity: 0;
}

.splash-bar-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.55);
    transition: width 300ms linear;
}
</style>