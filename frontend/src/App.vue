<script setup lang="ts">
import { onMounted } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            authStore.setUser(user);
        } else {
            authStore.clearUser();
        }
    });
});
</script>

<template>
    <RouterView />
</template>