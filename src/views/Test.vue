<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 12/1/2020 -->
<template>
    <div class="randomComic">
        <v-container>
             <Notifications></Notifications>
            <v-row v-show="showLoader" class="height-progress-loader" align="center" justify="center">
                <v-col align="center" justify="center" cols="12" md="6" xl="12">
                    <!-- Put countdown timer and other stuff here -->
                    <v-progress-circular color="primary" v-resize="onResize" v-show="showLoader" width="2" :size="maxSize" indeterminate></v-progress-circular>
                </v-col>
            </v-row>
            <v-row v-if="!showLoader" no-gutters class="d-flex justify-center text-center">
                <v-col cols="12" md="6" lg="6" xl="4">
                    <v-img class="grey darken-4" height="480" width="623" contain transition="slide-x-transition" :src="comic.comicCoverURL"></v-img>
                    <v-btn v-if="isAuthed == true" class="mb-lg-2 mb-xl-0 mt-xl-2 ml-lg-2 red" @click="addToFavourites(comic.comicId, headers)" icon color="white">
                        <v-icon>mdi-heart</v-icon>
                    </v-btn>
                    <v-btn class="mb-lg-2 mb-xl-0 mt-xl-2 ml-2 no-deco-link success" @click="getRandComic" icon color="white">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </v-col>
                <v-col class="ml-6" cols="12" md="3" lg="5" xl="5">
                    <span class="grey--text">Comicbook name</span>
                    <p>{{ comic.comicName }}</p>
                    <span class="grey--text">Author</span>
                    <p>{{ comic.comicAuthor }}</p>
                    <span class="grey--text">From Series</span>
                    <p><a class="no-deco-wo-hover" :href="comic.seriesURL">This</a></p>
                    <span class="grey--text">Comic Price</span>
                    <p><span class="mr-xl-0">{{ comic.price }}</span>
                        <v-tooltip bottom color="rgba(25, 118, 210, 1)">
                            <template v-slot:activator="{ on: tooltip }">
                                <v-dialog v-model="dialog" width="500">
                                    <template v-slot:activator="{ on: dialog }">
                                        <v-btn class="ml-xl-0" v-on="{...tooltip, ...dialog}" icon color="black">
                                            <v-icon class="pb-xl-1" color="info" size="23">mdi-history</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-card class="pt-xl-5">
                                        <v-card-text v-if="comic.priceHistory != null && Object.keys(comic.priceHistory).length > 0">
                                            <v-sheet>
                                                <BarChart :priceHistory="comic.priceHistory"></BarChart>
                                                <h3 class="font-weight-light white--text text-center mt-xl-2 pb-xl-2">Prices since comic release</h3>
                                            </v-sheet>
                                        </v-card-text>
                                        <v-card-text class="font-weight-bold" v-else>
                                            No price history available yet!
                                        </v-card-text>
                                        <v-divider></v-divider>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="primary" text @click="dialog = false">
                                                Close
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </template>
                            <span>Price History</span>
                        </v-tooltip>
                    </p>
                    <span class="mt-xl-4 primary--text font-weight-bold">Release date</span>
                    <p>{{ comic.releaseDateFormatted }}</p>
                    <p class="primary--text font-weight-bold">Buy Comic</p>
                    <p class="mt-xl-n3"><a class="no-deco-wo-hover" :href="comic.buyURL">Here</a></p>
                </v-col>
            </v-row>
            <v-row v-if="!showLoader" no-gutters class="d-flex mt-xl-4 ml-xl-12 justify-center text-center">
                <v-col cols="12" xl="12">
                    <h3 class="info--text mt-xl-12  font-weight-bold">Comic Description</h3>
                    <p class="text-left">{{ comic.comicDesc }}</p>
                </v-col>
            </v-row>
             <v-row v-if="!showLoader">
                 <h4 class="font-weight-light mx-auto mt-xl-3 primary--text">Leave a comment</h4>
                <v-col v-if="accessTokenDecoded !== null" cols="12" md="6" lg="12" xl="12" class="d-flex justify-center mt-2">
               
                    <v-form id="comment-form" @submit.prevent="postComment(headers)" class="text-center mx-auto flex-basis-33" ref="commentform" v-model="valid">
                        <v-text-field type="text" name="commenterName" v-model="form.name" :counter="25" :rules="nameRules" label="Nickname" required></v-text-field>
                        <v-textarea name="commentContent" v-model="form.content" :rules="commentRules" label="Your comment..." auto-grow required></v-textarea>
                        <v-btn type="submit" text class="primary">Publish</v-btn>
                    </v-form>
                </v-col>
                <v-col cols="12" xl="12" class="text-center" v-else>
                    <div>
                        <h3 class="text-center primary--text mt-xl-5 font-weight-light">You need to login in order to post a comment!</h3>
                        <v-btn depressed @click="handleLogin" class="mt-xl-2" color="primary">Login</v-btn>
                    </div>
                </v-col>
                <v-col cols="12" xl="12">
                    <v-divider class="mt-xl-6 mb-xl-3"></v-divider>
                </v-col>
                <v-col cols="12" md="6" xl="12" class="d-flex mt-xl-4 justify-center" v-for="comment in comments" :key="comment.commentId">
                    <v-card class="flex-basis-33">
                        <v-card-title class="pb-0">{{ comment.commenterName }}</v-card-title>
                        <v-card-text class="grey--text text--darken-2 pb-0 mt-0">{{ comment.formattedCommentDate }}</v-card-text>
                        <v-card-text class="grey--text text--darken-4">{{ comment.commentContent }}</v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import BarChart from '@/components/BarChart.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        form: {
            name: '',
            content: ''
        },
        comments: [],
        comic: {},
        valid: false,
        headers: new Headers(),
        showLoader: true,
        dialog: false,
        maxSize: 0,
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        isAuthed: false,
        loggedInUser: null,
        nameRules: [
            v => !!v || 'Name is required',
            v => (!!v && v.length <= 25) || 'Name must be less than 25 characters',
        ],
        commentRules: [
            v => !!v || 'Comment cannot be empty!',
        ]
    }),
    created: async function() {
        this.isAuthed = await this.$auth.isAuthenticated();
        const readyHandler = () => {
            if (document.readyState == 'complete') {
                setTimeout(function() {
                    this.showLoader = false;
                    document.removeEventListener('readystatechange', readyHandler);
                }.bind(this), 3000);
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
        this.comic = await getResourceJson('http://localhost:8080/getRandComic');
        this.comments = await getResourceJson('http://localhost:8080/getComments?cId=' + this.comic.comicId);
        this.loggedInUser = await this.$auth.getUser();
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        onResize() {
            if (document.documentElement.clientWidth > 1900) {
                this.maxSize = document.documentElement.clientWidth * 0.35;
            } else {
                this.maxSize = document.documentElement.clientWidth * 0.9;
            }
        },
        async getRandComic() {
            this.showLoader = true;
            this.comic = await getResourceJson('http://localhost:8080/getRandComic');
            setTimeout(function() {
                this.showLoader = false;
            }.bind(this), 3000);
        },
        postComment(headers) {
            if (!this.$refs.commentform.validate()) {
               // this.toggleAlert("Data is missing or in an incorrect format! Please review your entered data and try again!");
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('comment-form');
            fetch('http://localhost:8080/postComment?cId=' + this.comic.comicId, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: new FormData(formElement)
            }).then(function(response) {
                return response.text();
            }).then(async function(respText) {
              //  this.toggleAlert(respText);
               eventHub.$emit("notifyUser", respText);
                this.comments = await getResourceJson('http://localhost:8080/getComments?cId=' + this.comic.comicId);
            }.bind(this))
            // form needs to be reset here somehow
            this.$refs.form.reset()
        },
        addToFavourites(comicId, headers) {
            if (this.isAuthed != false) {
                fetch('http://localhost:8080/addFavourite?u=' + this.loggedInUser.email + '&cId=' + comicId, {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        //this.toggleAlert(message)
                        eventHub.$emit("notifyUser", message);
                    }.bind(this))
            } else {
                this.toggleAlert("You are not currently logged-in!")
            }
        },
    },
    components: {
        'Notifications': Notifications,
        'BarChart': BarChart
    }
}
</script>