<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 11/29/2020 -->
<template>
    <div class="comics">
        <h3 class="text-center primary--text  font-weight-light">{{ currSelected }} Comics</h3>
        <v-container fluid class="text-center">
            <AnnouncementDialog></AnnouncementDialog>
            <ShareDialog></ShareDialog>
            <!-- v-snackbar-based notifications - can be multiple v-snackbars instead of just one -->
            <Notifications></Notifications>
            <v-row>
                <v-col cols="4" md="2" xl="1">
                    <v-btn @click="showAnnouncements" icon color="info">
                        <v-icon>mdi-information</v-icon>
                    </v-btn>
                    <v-btn icon depressed to="/addComic" v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" color="success">
                        <v-icon class="text-left">mdi-plus-circle</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="4" md="2" xl="11" class="text-right">
                    <v-select class="d-inline-block select-max-width" dense v-model="defValue" :menu-props="{bottom: true, offsetY: true}" @change="showChosenComicType" :items="comicTypes" label="Select comic type..." outlined></v-select>
                </v-col>
            </v-row>
            <v-layout row wrap class="justify-flex-space-evenly">
                <!-- Need to do a v-for on the v-flex later to dynamically generate contents - also do a ml-X class for a left margin-->
                <v-flex xs12 lg3 xl2 class="comics-margin" v-for="comic in comics" :key="comic.comicId">
                    <v-skeleton-loader :loading="loading" transition="slide-x-transition" type="card">
                        <v-card max-width="344" v-show="!loading">
                            <v-row>
                                <v-col>
                                    <v-flex class="text-center" xs12>
                                        <!-- later on names here need to dynamically generated from the data we pull
                                      through the fetch api -->
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
import AnnouncementDialog from '@/components/AnnouncementDialog.vue'
import ShareDialog from '@/components/ShareDialog.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, setUserToken, getResourceJson } from '@/common.js'
import { mdiShareVariant } from '@mdi/js'
export default {
    data: () => ({
        defValue: 'Upcoming',
        currSelected: 'Upcoming',
        comicTypes: ['Upcoming', 'Released', 'Classic'],
        comics: [],
        loading: true,
        loaded: false,
        accessTokenEncoded: '',
        loggedInUser: null,
        currTimeout: null,
        headers: '',
        accessTokenDecoded: null,
        icons: { 'share': mdiShareVariant }
    }),
    components: {
        'Notifications': Notifications,
        'AnnouncementDialog': AnnouncementDialog,
        'ShareDialog': ShareDialog
    },
    created: async function() {
        const readyHandler = () => {
            if (document.readyState == 'complete') {
                setTimeout(() => {
                    this.loading = false;
                    this.loaded = true;
                }, 1000);
                document.removeEventListener('readystatechange', readyHandler);
            }
        };
        document.addEventListener('readystatechange', readyHandler);
        readyHandler(); // in case the component has been instantiated lately after loading
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
    },
    mounted: async function() {
        this.comics = await getResourceJson('http://localhost:8080/comicType?t=upcoming')
        this.headers = new Headers({
            'X-XSRF-TOKEN': getToken()
        })
        await this.refreshAccessToken()
        this.headers = setUserToken(this.headers, this.accessTokenEncoded)
        this.loggedInUser = await this.$auth.getUser();
    },
    methods: {
        async refreshAccessToken() {
            this.accessTokenEncoded = await getEncodedAccessToken()
            this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded)
        },
        // Add a check for checking if there is a logged in user - if not show a message that the app cannot identify the user
        // Do this for all pages that allow adding favourite comics
        async addFavourite(comicId, headers) {
            if (this.loggedInUser !== null) {
                fetch('http://localhost:8080/addFavourite?u=' + this.loggedInUser.sub + '&cId=' + comicId, {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        eventHub.$emit('notifyUser', message);
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "You are not currently logged-in!");
            }
        },
        async removeComic(comicId, headers) {
            await this.refreshAccessToken()
            if (comicId === null || typeof comicId !== "number") {
                eventHub.$emit('notifyUser', "Cannot delete this comic - insufficient or incorrect data provided!");
                return;
            }

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
                        eventHub.$emit('notifyUser', message);
                        this.comics = await getResourceJson('http://localhost:8080/comicType?t=upcoming')
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "Cannot delete comic!");
            }
        },
        openShareDialog(comicId) {
            eventHub.$emit("toggleShareDialog", this.comics.filter(comic => comic.comicId === comicId)[0]);
        },
        showAnnouncements() {
            eventHub.$emit("toggleAnnouncements");
        },
        async showChosenComicType(chosenType) {
            if (!this.loading && this.loaded) {
                this.loading = true; 
                this.loaded = false;
                this.currSelected = chosenType;
            } else clearTimeout(this.currTimeout);
            this.comics = await getResourceJson("http://localhost:8080/comicType?t=" + chosenType);
            this.currTimeout = setTimeout(() => {
                this.loading = false;
                this.loaded = true;
            }, 1000);
        }
    }
}
</script>