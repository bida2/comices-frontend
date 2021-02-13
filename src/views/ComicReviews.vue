<template>
    <div class="reviews">
        <StatusAlerts></StatusAlerts>
        <v-container fluid class="text-center my-1" v-if="resourceLoaded == true && (reviews != null && reviews != undefined)">
            <AnnouncementDialog></AnnouncementDialog>
            <h2 class="text-center primary--text font-weight-light mb-xl-8">Reviews</h2>
            <div v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" class="text-left mb-xl-0 ml-xl-9">
                <v-btn class="mb-lg-3" icon depressed to="/addComicReview" color="success">
                    <v-icon>mdi-plus-circle</v-icon>
                </v-btn>
                <v-btn  class="mb-lg-3" @click="showAnnouncements" icon color="info">
                    <v-icon>mdi-information</v-icon>
                </v-btn>
            </div>
            <Notifications></Notifications>
            <v-layout row wrap>
                <v-row class="mb-xl-3" v-for="review in reviews" :key="review.reviewId">
                    <v-col class="d-flex justify-center pt-xl-0" cols="12" md="6" lg="11" xl="12">
                        <v-skeleton-loader :loading="loading" transition="slide-x-transition" min-width="344" type="card">
                            <v-card max-width="344" v-show="!loading">
                                <v-card-text>
                                    <h3 v-html="review.reviewTitle" class="primary--text text--lighten-1 ma-0 review-title">
                                    </h3>
                                    <div class="mt-xl-1">Posted on {{ review.reviewDateTimeFormatted }}</div>
                                    <div v-html="review.reviewContent" class="text--primary mt-xl-4 review-content">
                                    </div>
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn text color="deep-purple accent-4">
                                        <router-link class="title-link" :to="'/review?rId=' + review.reviewId">Read More</router-link>
                                    </v-btn>
                                </v-card-actions>
                                <div v-if="accessTokenDecoded.groups.includes('admins')">
                                    <v-divider></v-divider>
                                    <v-btn text color="deep-purple accent-4">
                                        <router-link v-if="accessTokenDecoded.groups.includes('admins')" class="ml-xl-1 title-link warning--text text--darken-2" :to="'/editReview?rId=' + review.reviewId">Edit Review</router-link>
                                    </v-btn>
                                    <v-btn v-if="accessTokenDecoded.groups.includes('admins')" class="red--text text--darken-2" text depressed @click="deleteReview(headers,review.reviewId)">
                                        Delete Review
                                    </v-btn>
                                </div>
                            </v-card>
                        </v-skeleton-loader>
                    </v-col>
                </v-row>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import AnnouncementDialog from '@/components/AnnouncementDialog.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getDecodedAccessToken, getEncodedAccessToken, getToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        reviews: null,
        loading: true,
        accessTokenEncoded: null,
        resourceLoaded: false,
        accessTokenDecoded: null,
        headers: new Headers(),
        csrfToken: '',
        loaded: false,
    }),
    created: function() {
        const readyHandler = () => {
            if (document.readyState == 'complete') {
                setTimeout(function() {
                    this.loading = false;
                    this.loaded = true;
                }.bind(this), 1000)
                document.removeEventListener('readystatechange', readyHandler);
            }
        };
        document.addEventListener('readystatechange', readyHandler);
        readyHandler();
         eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        reviews() {
            if (this.reviews) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the comic review!");
            }
        }
    },
    methods: {
        deleteReview(headers, reviewId) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/deleteReview?rId=' + reviewId, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(async function(message) {
                        eventHub.$emit("notifyUser", message);
                        this.reviews = await getResourceJson('http://localhost:8080/getReviews');
                    }.bind(this))
            } else {
               eventHub.$emit("notifyUser", "Cannot delete review!");
            }
        },
        showAnnouncements() {
            eventHub.$emit("toggleAnnouncements");
        },
       truncContent(contentWordLimit, titleWordLimit) {
        // If the title of the revuew is over a chosen content word limit - truncate it to the limit, add ... at end of title
            // If the review's content is over a chosen title word limit - truncate it to the limit, add ... at the end
            this.reviews.forEach((review) => {
                let splitContent = review.reviewContent.split(" ");
                let splitTitle = review.reviewTitle.split(" ");
                if (splitContent.length > contentWordLimit) {
                    splitContent.splice(contentWordLimit, splitContent.length - contentWordLimit, '');
                    review.reviewContent = splitContent.join(" ") + "...";
                }
                if (splitTitle.length > titleWordLimit) {
                    splitTitle.splice(titleWordLimit, splitTitle.length - titleWordLimit, '');
                    review.reviewTitle = splitTitle.join(" ") + "...";
                }

            });
       }
    },
    mounted: async function() {
        this.reviews = await getResourceJson('http://localhost:8080/getReviews');
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
        this.truncContent(10, 10);
    },
    components: {
        'Notifications': Notifications,
        'AnnouncementDialog': AnnouncementDialog,
        'StatusAlerts': StatusAlerts
    }
}
</script>