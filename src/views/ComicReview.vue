<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 11/28/2020 -->
<template>
    <div class="reviews">
        <v-container fluid class="text-center my-1">
           <Notifications></Notifications>
            <v-layout row wrap>
                <v-row class="mb-xl-3">
                    <v-col cols="12" md="6" lg="8" xl="12">
                        <h3 id="title-field" class="text-center primary--text font-weight-light ma-0 pa-0" v-html="review.reviewTitle"></h3>
                        <p class="mt-xl-1 grey--text"> Posted on: {{review.reviewDateTimeFormatted}} </p>
                        <p id="content-field" class="mt-xl-3" v-html="review.reviewContent"></p>
                        <iframe v-if="review.videoURL" width="560" height="315" :src="review.videoURL" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <div class="mt-xl-6"><span class="primary--text">Reviewer Score</span>
                        <v-rating v-model="review.revScore" readonly color="primary"></v-rating></div>
                        <h4 class="text-center primary--text font-weight-bold mt-xl-8 pa-xl-3">Did you like this review? Vote below!</h4>
                        <v-btn @click="giveThumbs('Up', review.reviewId, headers)" icon>
                            <v-icon>mdi-thumb-up</v-icon>
                            <span class="ml-xl-1">{{ review.thumbsUp }}</span>
                        </v-btn>
                        <v-btn @click="giveThumbs('Down', review.reviewId, headers)" class="ml-xl-3" icon>
                            <v-icon>mdi-thumb-down</v-icon>
                            <span class="ml-xl-1">{{ review.thumbsDown }}</span>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        review: {},
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        loggedInUser: null,
    }),
    mounted: async function() {
        this.review = await getResourceJson('http://localhost:8080/getReview?rId=' + this.$route.query.rId);
        this.loggedInUser = await this.$auth.getUser();
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        giveThumbs(ratingType, rId, headers) {
            fetch('http://localhost:8080/rateReview?u=' + this.loggedInUser.sub + '&rId=' + rId + "&r=" + ratingType, {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                })
                .then(function(response) {
                    return response.text()
                })
                .then(async function(message) {
                    this.review = await getResourceJson('http://localhost:8080/getReview?rId=' + this.$route.query.rId);
                  //  this.toggleAlert(message);
                  eventHub.$emit("notifyUser", message);
                }.bind(this))
        },
    },
    components: {
        "Notifications": Notifications
    }
}
</script>