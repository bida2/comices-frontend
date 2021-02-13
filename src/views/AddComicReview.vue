<template>
    <div class="addComicReview">
        <v-container>
            <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Add A Comic Review</h3>
                    <FormatToolbar></FormatToolbar>
                    <v-form id="comic-form" @submit.prevent="addComicReview(headers)" class="text-center" ref="addreviewform" v-model="valid">
                        <v-text-field id="review-title" name="reviewName" v-model="review.reviewTitle" :rules="reviewRules" label="Review Name" required>
                        </v-text-field>
                        <v-text-field name="reviewVideo" :rules="urlRules" label="Review YouTube Embed URL (optional)">
                        </v-text-field>
                        <v-text-field name="revScore" single-line label="Enter your score (1 to 5)" :rules="scoreRules" type="number" required />
                        <v-textarea id="review-content" class="mt-xl-4" :rules="reviewRules" v-model="review.reviewContent" name="reviewContent" required label="Review Content"></v-textarea>
                        <v-btn type="submit" text class="primary">Save Review</v-btn>
                        <v-btn text @click="$refs.addreviewform.reset()" class="error ml-xl-2">Reset</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="!accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col class="ma-0" cols="12" md="6" xl="4">
                    <v-alert class="ma-0" type="error" transition="slide-x-transition">
                        Insufficient priviliges to view this page!
                    </v-alert>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import FormatToolbar from '@/components/FormatToolbar.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
import { notEmpty, reviewScore, optionalValidUrl } from '@/validations.js'
export default {
    data: () => ({
        reviewNameValue: '',
        reviewRequest: null,
        review: {
            reviewTitle: "",
            reviewContent: ""
        },
        valid: false,
        headers: new Headers(),
        scoreRules: [
        notEmpty,
            reviewScore
        ],
        reviewRules: [
        notEmpty,
        ],
        urlRules: [
            optionalValidUrl
        ],
        csrfToken: '',
        accessTokenEncoded: '',
        accessTokenDecoded: null,
    }),
    methods: {
        addComicReview(headers) {
            if (!this.$refs.addreviewform.validate()) {
                eventHub.$emit('notifyUser', 'Data is missing or in an incorrect format! Please review your entered data and try again!');
                return;
            }
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                const formElement = document.getElementById('comic-form');
                fetch('http://localhost:8080/addReview', {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        eventHub.$emit('notifyUser', message);
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "Access denied! Cannot submit new comic!");
            }

        }
    },
    created: async function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this));
        eventHub.$on('formatText', (type,formattedText) => {
            if (type === "title") {
                this.review.reviewTitle = formattedText;
            } else {
                this.review.reviewContent = formattedText;
            }
        });
    },
    mounted: async function() {
        if (this.$route.query.rId) {
            this.reviewRequest = await getResourceJson('http://localhost:8080/getReviewRequest?rId=' + this.$route.query.rId);
            this.reviewNameValue = this.reviewRequest.requestComicName;
        }
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    components: {
        'Notifications': Notifications,
        'FormatToolbar': FormatToolbar
    }
}
</script>