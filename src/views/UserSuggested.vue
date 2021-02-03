<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 11/28/2020 -->
<template>
    <div class="userSuggested">
        <h3 class="text-center primary--text font-weight-light">Comics You Suggested</h3>
        <v-container fluid class="text-center my-5">
           <Notifications></Notifications>
            <StatusAlerts></StatusAlerts>
            <v-layout row wrap>
            <v-card v-for="comic in suggestedComics" :key="comic.comicId" class="mx-auto" max-width="300">
                <v-hover v-slot="{ hover }">
                    <v-img class="white--text align-end" height="200px" :src="comic.comicCoverURL">
                        <v-card-title :class="{'d-none': hover}" class="black-background-70-opacity">{{ comic.suggestedComicName }}</v-card-title>
                    </v-img>
                </v-hover>
                <v-card-subtitle class="pb-0">
                    Author: {{ comic.suggestedAuthorName }}
                </v-card-subtitle>
                <v-card-subtitle class="pt-0">
                    Suggested By: {{ comic.suggesterUsername }}
                </v-card-subtitle>
                <v-card-text class="text--primary">
                    <hr>
                    <h4>Buy From</h4>
                    <hr>
                    <a class="no-deco-link" :href="comic.buyURL">Click to buy!</a>
                    <hr class="mt-3">
                    <h4>Comic Series Info</h4>
                    <hr>
                    <a class="no-deco-link" :href="comic.seriesURL">Get Info Here!</a>
                </v-card-text>
                <v-card-actions v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                    <v-btn @click="addToComics(comic.suggestionId, headers)" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn @click="rejectSuggestedComic(comic.suggestionId, headers)" icon>
                        <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                    <v-btn :to="'/editComicSuggestion?suggid=' + comic.suggestionId" icon>
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-layout>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import StatusAlerts from '@/components/StatusAlerts.vue'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
export default {
    data: () => ({
        suggestedComics: [],
        //loading: true,
       // loaded: false,
        accessTokenEncoded: '',
        headers: new Headers(),
        loggedInUser: '',
        csrfToken: '',
        accessTokenDecoded: null,
    }),
    created: async function() {
       /* const readyHandler = () => {
            if (document.readyState == 'complete') {
                setTimeout(function() {
                    this.loading = false;
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
    mounted: async function() {
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
        this.getUserAndFavourites()
    },
    watch: {
        suggestedComics() {
            if (this.suggestedComics.length > 0 && document.readyState === "complete") {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else if (this.suggestedComics.length === 0 && document.readyState === "complete") {
                eventHub.$emit('changeStatusAlert', false, null, "No suggested comics! Visit the \"Suggest a Comic\" page in the sidebar!");
            }
        }
    },
    methods: {
        async getUserAndFavourites() {
            this.loggedInUser = await this.$auth.getUser()
            this.getSuggestedComics(this.headers)
        },
        getSuggestedComics(headers) {
            fetch('http://localhost:8080/getSuggestions?u=' + this.loggedInUser.email, {
                    method: 'GET',
                    headers,
                    credentials: 'include'
                })
                .then(function(response) {
                    return response.json()
                }).then(function(myJson) {
                    this.suggestedComics = myJson;
                }.bind(this))
        },
        addToComics(suggestedComicId, headers) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/approveSuggestedComic?cid=' + suggestedComicId, {
                        method: 'PUT',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        //this.toggleAlert(message);
                        eventHub.$emit("notifyUser", message);
                        this.getSuggestedComics(this.headers);
                    }.bind(this))
            } else {
                //this.toggleAlert("You are not currently logged-in!");
                eventHub.$emit("notifyUser", "You are not currently logged-in!");
            }
        },
        rejectSuggestedComic(suggestedComicId, headers) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/rejectSuggestedComic?cid=' + suggestedComicId, {
                        method: 'PUT',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                       // this.toggleAlert(message);
                       eventHub.$emit("notifyUser", message);
                        this.getSuggestedComics(this.headers);
                    }.bind(this))
            } else {
                //this.toggleAlert("You are not currently logged-in!");
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