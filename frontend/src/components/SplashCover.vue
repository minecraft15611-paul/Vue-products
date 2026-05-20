<script setup lang="ts">
import { ref, onMounted } from 'vue';

const visible = ref(true);
const leaving = ref(false);
const progress = ref(0);

const FAST_DURATION = 3000;   // ms — server awake
const SLOW_DURATION = 15000;  // ms — server cold start
const HEALTH_TIMEOUT = 1000;  // ms — ping deadline
const EXIT_DURATION  = 600;   // ms — fade out

const animateProgress = (durationMs: number) => {
    const startTime = performance.now();

    const tick = (now: number) => {
        const elapsed = now - startTime;
        progress.value = Math.min((elapsed / durationMs) * 100, 100);

        if (elapsed < durationMs) {
            requestAnimationFrame(tick);
        } else {
            // Progress complete — start exit animation
            leaving.value = true;
            setTimeout(() => {
                visible.value = false;
            }, EXIT_DURATION);
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
    <Transition name="splash-exit">
        <div v-if="visible" class="splash-cover" :class="{ leaving }">
            <div class="splash-bar-track">
                <div class="splash-bar-fill" :style="{ width: progress + '%' }" />
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.splash-cover {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #fff;
    display: flex;
    align-items: flex-start;
    pointer-events: all;
}

/* thin bar at very top of screen */
.splash-bar-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.splash-bar-fill {
    height: 100%;
    background: #000;
    transition: width 300ms linear;
    border-radius: 0 2px 2px 0;
}

/* Exit: fade out over 600ms */
.splash-exit-leave-active {
    transition: opacity 600ms ease, transform 600ms ease;
}

.splash-exit-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.splash-exit-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>