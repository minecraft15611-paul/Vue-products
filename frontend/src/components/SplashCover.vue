<script setup lang="ts">
import { ref, onMounted } from 'vue';

const API = import.meta.env.VITE_API_URL;

const visible    = ref(true);
const leaving    = ref(false);
const progress   = ref(0);
const barVisible = ref(true);

const FAST_DURATION  = 3000;
const SLOW_DURATION  = 21000;
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

        await fetch(`${API}/api/health`, {
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

