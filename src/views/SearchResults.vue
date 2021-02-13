<template>
    <div class="searchResults">
        <StatusAlerts></StatusAlerts>
        <v-container fluid class="text-center my-5" v-if="resourceLoaded == true && (comics != null && comics != undefined)">
            <h3 class="text-center primary--text  font-weight-light">Search Results for "{{$route.query.f}}"</h3>
            <Notifications></Notifications>
            <ShareDialog></ShareDialog>
            <v-layout row wrap class="justify-flex-space-evenly">
                <v-flex xs12 lg3 xl2 class="comics-margin" v-for="comic in comics" :key="comic.comicId">
                    <v-skeleton-loader :loading="loading" transition="slide-x-transition" type="card">
                        <v-card max-width="344" v-show="!loading">
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
                                        <v-row class="mt-xl-n4">
                                            <v-col>
                                                <v-btn icon @click="openShareDialog(comic.comicId)">
                                                    <v-icon>{{ icons['share'] }}</v-icon>
                                                </v-btn>
                                            </v-col>
                                            <v-col v-if="accessTokenDecoded !== null">
                                                <v-btn @click="addFavourite(comic.comicId, headers)" icon>
                                                    <v-icon>mdi-heart</v-icon>
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
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import ShareDialog from '@/components/ShareDialog.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, setUserToken, getResourceJson } from '@/common.js'
import { mdiShareVariant } from '@mdi/js'
export default {
    data: () => ({
        comics: null,
        loading: true,
        loaded: false,
        announceCard: true,
        resourceLoaded: false,
        accessTokenEncoded: '',
        loggedInUser: null,
        headers: '',
        accessTokenDecoded: null,
        icons: { 'share': mdiShareVariant }
    }),
    created: async function() {
        const readyHandler = () => {
            if (document.readyState == 'complete') {
                this.loading = false;
                this.loaded = true;
                document.removeEventListener('readystatechange', readyHandler);
            }
        };
        document.addEventListener('readystatechange', readyHandler);
        readyHandler();
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
         eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        comics() {
            if (this.comics) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the search results!");
            }
        },
        async '$route'() {
            this.comics = await getResourceJson('http://localhost:8080/searchComic?f=' + this.$route.query.f)
            if (this.comics.length == 0)
                eventHub.$emit("notifyUser", 'No comics available for search query!');
        }
    },
    mounted: async function() {
        this.comics = await getResourceJson('http://localhost:8080/searchComic?f=' + this.$route.query.f)
        if (this.comics.length == 0)
            eventHub.$emit("notifyUser", 'No comics available for search query!');
        this.headers = new Headers({
            'X-XSRF-TOKEN': getToken()
        })
        await this.refreshAccessToken()
        this.headers = setUserToken(this.headers, this.accessTokenEncoded)
    },
    methods: {
        async refreshAccessToken() {
            this.accessTokenEncoded = await getEncodedAccessToken()
            this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded)
        },
        async addFavourite(comicId, headers) {
            this.loggedInUser = await this.$auth.getUser()
            if (this.loggedInUser !== null) {
                fetch('http://localhost:8080/addFavourite?u=' + this.loggedInUser.email + '&cId=' + comicId, {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        eventHub.$emit("notifyUser", message);
                    }.bind(this))
            } else {
                eventHub.$emit("notifyUser", "You are not currently logged-in!");
            }
        },
        async removeComic(comicId, headers) {
            await this.refreshAccessToken()
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
                        eventHub.$emit("notifyUser", message);
                        this.comics = await getResourceJson('http://localhost:8080/searchComic?f=' + this.$route.query.f)
                    }.bind(this))
            } else {
                eventHub.$emit("notifyUser", "Cannot delete comic!");
            }
        },
        openShareDialog(comicId) {
            eventHub.$emit("toggleShareDialog", this.comics.filter(comic => comic.comicId === comicId)[0]);
        },
    },
    components: {
        'Notifications': Notifications,
        'ShareDialog': ShareDialog,
        'StatusAlerts': StatusAlerts
    }
}
</script>