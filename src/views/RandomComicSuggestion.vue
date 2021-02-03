<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 12/1/2020 -->
<template>
    <div class="randomComic">
        <v-container>
            <Notifications></Notifications>
            <!-- This is here in order to prevent endless loader spinning and show the user a message when retrieving a random comic has failed
             This needs to be on pretty much every page -->
            <v-row v-if="!showLoader && comic === undefined" no-gutters class="d-flex justify-center text-center">
                <v-col cols="12" md="3" lg="5" xl="5">
                    <h3>Something went wrong!</h3>
                    <p>Refresh the page or contact the administrator!</p>
                </v-col>
            </v-row>
            <v-row v-show="showLoader" class="height-progress-loader" align="center" justify="center">
                <v-col align="center" justify="center" cols="12" md="6" xl="12">
                    <!-- Put countdown timer and other stuff here -->
                    <v-progress-circular color="primary" v-resize="onResize" v-show="showLoader" width="2" :size="maxSize" indeterminate></v-progress-circular>
                </v-col>
            </v-row>
            <v-row v-if="!showLoader && comic != undefined" no-gutters class="d-flex justify-center text-center">
                <v-col cols="12" md="6" lg="6" xl="4">
                    <v-img class="grey darken-4" height="480" width="623" contain transition="slide-x-transition" :src="comic.comicCoverURL"></v-img>
                </v-col>
                <v-col class="ml-6 mt-7" cols="12" md="3" lg="5" xl="5">
                    <span class="mt-2 mt-sm-3 grey--text">Comicbook name</span>
                    <p>{{ comic.comicName }}</p>
                    <span class="grey--text">Comicbook summary</span>
                    <p>{{ comic.comicDesc }}</p>
                    <span class="primary--text font-weight-bold">Release date</span>
                    <p>{{ comic.releaseDateFormatted }}</p>
                    <span class="grey--text">Author</span>
                    <p>{{ comic.comicAuthor }}</p>
                    <span class="primary--text font-weight-bold">Price History</span>
                    <p><span class="mr-xl-0">{{ comic.price }}</span>
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
                    </p>
                    <span class="grey--text">Rate this comic</span>
                    <v-rating v-model="comicRating.rating" @input="setRating(headers, comic.comicId)" color="primary"></v-rating>
                    <v-row class="d-flex justify-center align-end text-center">
                        <v-col>
                            <v-btn class="mb-lg-2 mb-xl-0 ml-lg-2" depressed color="success"><a class="white--text no-deco-link" :href="comic.buyURL">Buy Comicbook</a></v-btn>
                            <v-btn class="ml-lg-2 ml-xl-2 mt-3 mt-lg-0 mt-xl-0 mt-md-0 mt-sm-0 mb-3 mb-sm-0 mb-md-0 mb-lg-0 mb-xl-0 white--text no-deco-link" router to="/" depressed color="red">Back to Comics</v-btn>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row v-if="!showLoader && comic != undefined" no-gutters class="d-flex text-xl-center text-lg-left pl-lg-3">
                <v-col cols="12" md="6" lg="4" xl="4">
                    <ul class="mt-xl-3 mt-lg-3 share-buttons share-buttons-left-padding">
                        <li><a href="https://www.facebook.com/sharer/sharer.php?u=&quote=" title="Share on Facebook" target="_blank"><img alt="Share on Facebook" src="../assets/flat_web_icon_set/color/Facebook.png" /></a></li>
                        <li class="ml-2"><a href="https://twitter.com/intent/tweet?source=&text=:%20" target="_blank" title="Tweet"><img alt="Tweet" src="../assets/flat_web_icon_set/color/Twitter.png" /></a></li>
                        <li class="ml-2"><a href="http://www.tumblr.com/share?v=3&u=&quote=&s=" target="_blank" title="Post to Tumblr"><img alt="Post to Tumblr" src="../assets/flat_web_icon_set/color/Tumblr.png" /></a></li>
                        <li class="ml-2"><a href="http://pinterest.com/pin/create/button/?url=&description=" target="_blank" title="Pin it"><img alt="Pin it" src="../assets/flat_web_icon_set/color/Pinterest.png" /></a></li>
                        <li class="ml-2"><a href="http://www.reddit.com/submit?url=&title=" target="_blank" title="Submit to Reddit"><img alt="Submit to Reddit" src="../assets/flat_web_icon_set/color/Reddit.png" /></a></li>
                        <li class="ml-2"><a href="https://pinboard.in/popup_login/?url=&title=&description=" target="_blank" title="Save to Pinboard"><img alt="Save to Pinboard" src="../assets/flat_web_icon_set/color/Pinboard.png" /></a></li>
                        <li class="ml-2"><a href="mailto:?subject=&body=:%20" target="_blank" title="Send email"><img alt="Send email" src="../assets/flat_web_icon_set/color/Email.png" /></a></li>
                    </ul>
                </v-col>
            </v-row>
            <v-row v-if="!showLoader && comic != undefined">
                <v-col cols="12" md="6" lg="12" xl="12">
                    <v-divider class="mt-xl-8 mt-lg-8"></v-divider>
                </v-col>
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
        comicRating: {
            rating: 0
        },
        comic: undefined,
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
        this.comic = await getResourceJson('http://localhost:8080/getRandComic').catch((err) => { console.error(err); });
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
            this.comic = await getResourceJson('http://localhost:8080/getRandComic').catch((err) => {
                console.error(err);
                console.log(this.comic);
            });
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
                fetch('http://localhost:8080/addFavourite?u=' + this.loggedInUser.sub + '&cId=' + comicId, {
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
        setRating(headers, comicId) {
            fetch('http://localhost:8080/setRating?cId=' + comicId + '&r=' + this.comicRating.rating + '&u=' + this.accessTokenDecoded.sub, {
                    method: 'POST',
                    headers,
                    credentials: 'include'
                }).then(function(responseText) {
                    return responseText.text();
                })
                .then(async function(response) {
                    // this.toggleAlert(response);
                    eventHub.$emit("notifyUser", response);
                    this.comicRating = await getResourceJson('http://localhost:8080/getRating?u=' + this.accessTokenDecoded.sub + '&cId=' + this.$route.query.cId);
                }.bind(this))
        }
    },
    components: {
        'Notifications': Notifications,
        'BarChart': BarChart
    }
}
</script>