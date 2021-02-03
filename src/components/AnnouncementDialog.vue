<template>
    <v-dialog v-model="announceCard" width="500">
        <v-card>
            <v-card-actions class="pa-xl-0 pa-lg-0">
                <strong class="pl-xl-4">Announcements</strong>
                <v-spacer></v-spacer>
                <v-btn @click="announceCard = !announceCard" icon>
                    <v-icon>mdi-close-circle</v-icon>
                </v-btn>
            </v-card-actions>
            <v-list-item two-line v-for="announcement in announcements.content" :key="announcement.annId">
                <v-list-item-content>
                    <v-list-item-title class="announce-title-size mb-xl-1">
                        <router-link class="announce-title" :to="'/announcement?aId=' + announcement.annId" v-html="announcement.annTitle"></router-link>
                    </v-list-item-title>
                    <v-list-item-subtitle class="announce-subtitle-size" v-html="announcement.annContent"></v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-card>
    </v-dialog>
</template>
<script>
import eventHub from '@/main.js'
import { getResourceJson } from '@/common.js'
export default {
    data: () => ({
        announceCard: false,
        announcements: []
    }),
    mounted: async function() {
    	this.announcements = await getResourceJson('http://localhost:8080/getAnnouncements');
    	eventHub.$on('toggleAnnouncements', () => {
    		this.announceCard = !this.announceCard;
    	});
    }
}
</script>