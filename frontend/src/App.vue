<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import SplashCover from './components/SplashCover.vue';

const authStore = useAuthStore();

onMounted(async () => {
    await authStore.initAuth();
});
</script>

<template>
    <SplashCover />
    <RouterView />
</template>