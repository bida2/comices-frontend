<template>
    <div class="searchTags">
        <StatusAlerts></StatusAlerts>
        <v-container class="text-center" v-if="resourceLoaded == true && (tags != null && tags != undefined)">
            <Notifications></Notifications>
            <h3 v-if="tags.length > 0" class="text-center primary--text mt-xl-5 mb-xl-4 font-weight-light">Search Tags - Click To Search!</h3>
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
        resourceLoaded: false,
        valid: false,
    }),
    mounted: async function() {
        this.tags = await getResourceJson("http://localhost:8080/getTags");
    },
    watch: {
        tags() {
            if (this.tags && Object.keys(this.tags).length > 0) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else if (this.tags && Object.keys(this.tags).length === 0) {
                eventHub.$emit('changeStatusAlert', false, null, "No search tags! Search some more!");
            } else if (this.tags == null || this.tags == undefined) {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the search tags!");
            }
        }
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications
    }
}
</script>