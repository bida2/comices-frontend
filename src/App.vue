<template>
    <v-app class="gray lighten-4">
        <Navbar />
        <v-main class="mx-4 mb-4 mt-4">
            <router-view />
        </v-main>
    </v-app>
</template>
<script>
import Navbar from '@/components/Navbar.vue'
import '@/assets/main.scss'
export default {
    name: 'App',
    components: {
        Navbar
    },
    data: () => ({
    }),
};
</script>