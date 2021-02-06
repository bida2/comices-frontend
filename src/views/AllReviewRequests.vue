<template>
    <div class="allReviewRequests">
        <h3 class="text-center primary--text font-weight-light">Comic Review Requests</h3>
        <v-container fluid class="text-center my-5">
            <Notifications></Notifications>
            <StatusAlerts></StatusAlerts>
            <v-layout row wrap class="justify-flex-space-evenly">
                <v-flex xs5 lg3 xl2 class="comics-margin" v-for="reviewRequest in reviewRequests" :key="reviewRequest.requestId">
                    <v-row>
                        <v-col>
                            <v-flex class="text-center" xs12>
                                <v-card max-width="344" v-show="loaded">
                                    <v-row>
                                        <v-col>
                                            <v-flex class="text-center" xs12>
                                                <p class="blue--text text--darken-4 title-link ma-0"> {{ reviewRequest.requestComicName }} </p>
                                            </v-flex>
                                        </v-col>
                                    </v-row>
                                    <v-divider></v-divider>
                                    <v-row>
                                        <v-col>
                                            <v-flex class="text-center" xs12>
                                                <a :href="reviewRequest.requestComicURL" target="_blank" class="ma-0"> {{ reviewRequest.requestComicURL }} </a>
                                            </v-flex>
                                        </v-col>
                                    </v-row>
                                    <v-divider></v-divider>
                                    <v-row class="pl-4">
                                        <v-col class="text-center">
                                            <v-container class="pa-0">
                                                <v-row>
                                                    <v-col v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                                                        <v-btn @click="removeReviewRequest(reviewRequest.requestId, headers)" icon>
                                                            <v-icon>mdi-close-circle</v-icon>
                                                        </v-btn>
                                                    </v-col>
                                                    <v-col v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                                                        <v-btn :to="'/addComicReview?rId=' + reviewRequest.requestId" icon>
                                                            <v-icon>mdi-pencil</v-icon>
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-flex>
                        </v-col>
                    </v-row>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import StatusAlerts from '@/components/StatusAlerts.vue'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        reviewRequests: [],
        loaded: false,
        accessTokenEncoded: '',
        headers: new Headers(),
        loggedInUser: '',
        csrfToken: '',
        accessTokenDecoded: null,
    }),
    created: async function() {
        const readyHandler = () => {
            if (document.readyState == 'complete') {
                setTimeout(function() {
                    this.loaded = true;
                }.bind(this), 1000)
                document.removeEventListener('readystatechange', readyHandler);
            }
        };
        document.addEventListener('readystatechange', readyHandler);
        readyHandler(); // in case the component has been instantiated lately after loading */
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
            this.loggedInUser = null;
        }.bind(this))
    },
    watch: {
        reviewRequests() {
            if (this.reviewRequests.length > 0) {
                setTimeout(() => {
                    // delay event in order to prevent the Granting Access message from flashing on screen
                    eventHub.$emit('changeStatusAlert', false, null, null);
                }, 1000);
            } else if (this.reviewRequests.length === 0) {
                setTimeout(() => {
                    // delay event in order to prevent the Granting Access message from flashing on screen
                    eventHub.$emit('changeStatusAlert', false, null, "No review requests! Get some users to write them!");
                }, 1000);
            }
        }
    },
    mounted: async function() {
        this.reviewRequests = await getResourceJson('http://localhost:8080/getReviewRequests');
        this.loggedInUser = await this.$auth.getUser();
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        removeReviewRequest(reviewRequestId, headers) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/deleteReviewRequest?rId=' + reviewRequestId, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(async function(message) {
                        eventHub.$emit("notifyUser", message);
                        this.reviewRequests = await getResourceJson('http://localhost:8080/getReviewRequests');
                    }.bind(this))
            } else {
                eventHub.$emit("notifyUser", "You are not currently logged-in!");
            }
        },
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications
    }
}
</script>