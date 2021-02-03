<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 11/28/2020 -->
<template>
    <div class="reviews">
        <v-container fluid class="text-center my-1">
           <Notifications></Notifications>
            <v-layout row wrap>
                <v-row class="mb-xl-3">
                    <v-col cols="12" md="6" lg="8" xl="12">
                        <h3 id="title-field" class="text-center primary--text font-weight-light ma-0 pa-0" v-html="announcement.annTitle"></h3>
                        <p class="mt-xl-1 grey--text"> Posted on: {{announcement.annFormattedDate}} </p>
                        <p id="content-field" class="mt-xl-3" v-html="announcement.annContent"></p>
                        <h4 class="text-center primary--text font-weight-bold mt-xl-5 pa-xl-3">Did you like this announcement? Vote below!</h4>
                        <v-btn @click="giveThumbs('Up', announcement.annId, headers)" icon>
                            <v-icon>mdi-thumb-up</v-icon>
                            <span class="ml-xl-1">{{ announcement.thumbsUp }}</span>
                        </v-btn>
                        <v-btn @click="giveThumbs('Down', announcement.annId, headers)" class="ml-xl-3" icon>
                            <v-icon>mdi-thumb-down</v-icon>
                            <span class="ml-xl-1">{{ announcement.thumbsDown }}</span>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-layout>
            <!-- Contains admin actions bar -->
            <div v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" class="text-center mb-xl-2">
                <v-btn class="mb-lg-2" icon depressed :to="'/editAnnouncement?aId=' + announcement.annId" color="warning">
                    <v-icon>mdi-pen</v-icon>
                </v-btn>
            </div>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        announcement: {},
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        loggedInUser: null,
    }),
    created: function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
    },
    mounted: async function() {
        this.announcement = await getResourceJson('http://localhost:8080/getAnnouncement?aId=' + this.$route.query.aId);
        this.loggedInUser = await this.$auth.getUser();
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        // Rating type can be "Up" or "Down" 
        giveThumbs(ratingType, annId, headers) {
            fetch('http://localhost:8080/rateAnnouncement?u=' + this.loggedInUser.sub + '&aId=' + annId + "&r=" + ratingType, {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                })
                .then(function(response) {
                    return response.text()
                })
                .then(async function(message) {
                    this.announcement = await getResourceJson('http://localhost:8080/getAnnouncement?aId=' + this.$route.query.aId);
                   // this.toggleAlert(message)
                   eventHub.$emit("notifyUser", message);
                }.bind(this))
        },

    },
    components: {
        "Notifications": Notifications
    }
}
</script>