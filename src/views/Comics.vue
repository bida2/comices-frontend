<template>
    <div class="comics">
        <StatusAlerts></StatusAlerts>
        <Notifications></Notifications>
        <v-container fluid class="text-center" v-if="resourceLoaded == true && (comics != null && comics != undefined)">
            <h3 class="text-center primary--text  font-weight-light">{{ currSelected }} Comics</h3>
            <AnnouncementDialog></AnnouncementDialog>
            <ShareDialog></ShareDialog>
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
                <v-flex xs12 lg3 xl2 class="mt-3 comics-margin" v-for="comic in comics" :key="comic.comicId">
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
import AnnouncementDialog from '@/components/AnnouncementDialog.vue'
import ShareDialog from '@/components/ShareDialog.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, setUserToken, getResourceJson } from '@/common.js'
import { mdiShareVariant } from '@mdi/js'
export default {
    data: () => ({
        defValue: 'Upcoming',
        currSelected: 'Upcoming',
        comicTypes: ['Upcoming', 'Released', 'Classic'],
        comics: null,
        loading: true,
        loaded: false,
        resourceLoaded: false,
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
        'ShareDialog': ShareDialog,
        'StatusAlerts': StatusAlerts
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
        readyHandler();
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
        eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    mounted: async function() {
        // Default is always Upcoming comics
        this.comics = await this.getAndCheckComics();
        this.headers = new Headers({
            'X-XSRF-TOKEN': getToken()
        })
        await this.refreshAccessToken()
        this.headers = setUserToken(this.headers, this.accessTokenEncoded)
        this.loggedInUser = await this.$auth.getUser();
    },
    watch: {
        comics() {
            if (this.comics) {
                eventHub.$emit('changeStatusAlert', false, null, null);
                if (this.comics.length === 0) eventHub.$emit("notifyUser", "No comics found for chosen comic release status!");
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the comics!");
            }
        }
    },
    methods: {
        async refreshAccessToken() {
            this.accessTokenEncoded = await getEncodedAccessToken()
            this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded)
        },
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
                        this.comics = await this.getAndCheckComics();
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "Cannot delete comic!");
            }
        },
        openShareDialog(comicId) {
            eventHub.$emit("toggleShareDialog", this.comics.filter(comic => comic.comicId === comicId)[0]);
        },
        async getAndCheckComics() {
            let request = await getResourceJson('http://localhost:8080/comicType?t=' + this.currSelected.toUpperCase());
            let comicStatus = request === undefined ? undefined : request.length > 0 ? request : [];
            return comicStatus;
        }
        ,
        showAnnouncements() {
            eventHub.$emit("toggleAnnouncements");
        },
        async showChosenComicType(chosenType) {
            if (!this.loading && this.loaded) {
                this.loading = true;
                this.loaded = false;
                this.currSelected = chosenType;
            } else clearTimeout(this.currTimeout);
            this.comics = await this.getAndCheckComics();
            this.currTimeout = setTimeout(() => {
                this.loading = false;
                this.loaded = true;
            }, 1000);
        }
    }
}
</script>