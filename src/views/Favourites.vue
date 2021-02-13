<template>
    <div class="profile">
        <StatusAlerts></StatusAlerts>
        <v-container fluid class="text-center my-5" v-if="resourceLoaded == true && (favourites != null && favourites != undefined)">
            <h3 class="text-center primary--text font-weight-light">Favourite Comics</h3>
            <Notifications></Notifications>
            <ShareDialog></ShareDialog>
            <v-layout row wrap class="justify-flex-space-evenly">
                <v-flex xs5 lg3 xl2 class="left-margin-without-first" v-for="comic in favourites" :key="comic.comicId">
                    <v-skeleton-loader :loading="!loaded" transition="slide-x-transition" type="card">
                        <v-card max-width="344" v-show="loaded">
                            <v-row>
                                <v-col>
                                    <v-flex class="text-center" xs12>
                                        <router-link class="blue--text text--darken-4 title-link" :to="'/summary?cId=' + comic.comicId"> {{ comic.comicName }} </router-link>
                                    </v-flex>
                                </v-col>
                            </v-row>
                            <v-row class="pl-4">
                                <v-col class="shrink">
                                    <v-img height="200" width="200" :src="comic.comicCoverURL"></v-img>
                                </v-col>
                                <v-col class="text-center">
                                    <v-container class="pa-0">
                                        <v-row>
                                            <v-col>
                                                <v-btn icon @click="openShareDialog(comic.comicId)">
                                                   <v-icon>{{ icons['share'] }}</v-icon>
                                                </v-btn>
                                            </v-col>
                                            <v-col>
                                                <v-btn @click="removeFavourite(comic.comicId, headers)" icon>
                                                    <v-icon>mdi-heart-off</v-icon>
                                                </v-btn>
                                            </v-col>
                                            <v-col v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                                                <v-btn @click="removeComic(comic.comicId, headers)" icon>
                                                    <v-icon>mdi-close-circle</v-icon>
                                                </v-btn>
                                            </v-col>
                                            <v-col v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                                                <v-btn :to="'/editComic?cId=' + comic.comicId" icon>
                                                    <v-icon>mdi-pencil</v-icon>
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-skeleton-loader>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
import eventHub from "@/main.js"
import Notifications from '@/components/Notifications.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import ShareDialog from '@/components/ShareDialog.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
import { mdiShareVariant } from '@mdi/js'
export default {
    data: () => ({
        favourites: null,
        loaded: false,
        accessTokenEncoded: '',
        headers: new Headers(),
        loggedInUser: '',
        resourceLoaded: false,
        csrfToken: '',
        accessTokenDecoded: null,
        icons: { 'share': mdiShareVariant }
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
        readyHandler();
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
            this.loggedInUser = null;
        }.bind(this))
          eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        favourites() {
            if (!this.favourites) {
                eventHub.$emit('changeStatusAlert', false, null, 'Something went wrong with retrieving your favourite comics!');
            }
            else if (this.favourites.length > 0) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else if (this.favourites.length === 0) {
                eventHub.$emit('changeStatusAlert', false, null, 'No favourited comics! Visit the Upcoming page or Classics page to find comics!');
            }
        }
    },
    mounted: async function() {
        this.loggedInUser = await this.$auth.getUser();
        this.favourites = await getResourceJson('http://localhost:8080/getFavourites?u=' + this.loggedInUser.sub);
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        removeComic(comicId, headers) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/delComic?cId=' + comicId, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(async function(message) {
                        this.favourites = await getResourceJson('http://localhost:8080/getFavourites?u=' + this.loggedInUser.sub);
                       eventHub.$emit("notifyUser", message);
                    }.bind(this))
            }
        },
         openShareDialog(comicId) {
            eventHub.$emit("toggleShareDialog", this.favourites.filter(comic => comic.comicId === comicId)[0]);
        },
        removeFavourite(comicId, headers) {
            fetch('http://localhost:8080/removeFavourite?u=' + this.loggedInUser.sub + '&cId=' + comicId, {
                    method: 'DELETE',
                    headers,
                    credentials: 'include',
                })
                .then(function(response) {
                    return response.text()
                }.bind(this))
                .then(async function(message) {
                    this.favourites = await getResourceJson('http://localhost:8080/getFavourites?u=' + this.loggedInUser.sub);
                    eventHub.$emit("notifyUser", message);
                }.bind(this))
        }
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications,
        'ShareDialog': ShareDialog
    }
}
</script>