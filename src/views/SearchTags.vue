<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 12/1/2020 -->
<template>
    <div class="searchTags">
        <v-container class="text-center">
             <!-- v-snackbar-based notifications - can be multiple v-snackbars instead of just one -->
            <Notifications></Notifications>
            <h3 v-if="tags" class="text-center primary--text mt-xl-5 mb-xl-4 font-weight-light">Search Tags - Click To Search!</h3>
            <StatusAlerts></StatusAlerts>
            <v-row v-if="tags" justify="center">
                <v-col class="pa-xl-0 ma-auto" v-for="(value,name) in tags" cols="1" md="1" xl="1" :key="name">
                    <v-btn text class="mt-xl-2 primary" :to="'/search?f=' + name">{{ name }}</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import StatusAlerts from '@/components/StatusAlerts.vue'
import Notifications from '@/components/Notifications.vue'
import eventHub from '@/main.js'
import { getResourceJson } from '@/common.js'
export default {
    data: () => ({
        tags: null,
        valid: false,
        alerts: []
    }),
    mounted: async function() {
        this.tags = await getResourceJson("http://localhost:8080/getTags");
    },
    watch: {
        tags() {
            if (Object.keys(this.tags).length > 0) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else if (Object.keys(this.tags).length === 0) {
                eventHub.$emit('changeStatusAlert', false, null, "No search tags! Search some more!");
            }
        }
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications
    }
}
</script>