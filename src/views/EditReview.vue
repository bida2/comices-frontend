<template>
    <div class="editPost">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (review != null && review != undefined)">
           <Notifications></Notifications>
            <FormatToolbar></FormatToolbar>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit A Comic Review</h3>
                    <v-form id="edit-review-form" @submit.prevent="submitReview(headers)" class="text-center" v-model="valid" ref="editreviewform">
                        <v-text-field id="review-title" name="reviewTitle" :rules="titleRules" :value="review.reviewTitle" label="Review Title"></v-text-field>
                        <v-textarea id="review-content" name="reviewContent" :rules="reviewRules" :value="review.reviewContent" label="Review Content" auto-grow required></v-textarea>
                        <v-btn type="submit" text class="primary">Submit Edit</v-btn>
                    </v-form>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import FormatToolbar from '@/components/FormatToolbar.vue'
import Notifications from '@/components/Notifications.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
import { notEmpty, descLength } from '@/validations.js'
export default {
    data: () => ({
        review: null,
        valid: false,
        headers: new Headers(),
        resourceLoaded: false,
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        reviewRules: [
            notEmpty,
            descLength
        ],
        titleRules: [
            notEmpty
        ]
    }),
    methods: {
        submitReview(headers) {
            if (!this.$refs.editreviewform.validate()) {
               eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('edit-review-form');
            fetch('http://localhost:8080/editReview?rId=' + this.$route.query.rId, {
                    method: 'PUT',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    return response.text()
                }).then(function(jsonResponse) {
                    eventHub.$emit("notifyUser", jsonResponse);
                    if (jsonResponse != "Review title or review content is empty!")
                        this.$router.go(-1);
                }.bind(this))
        },
    },
    created: async function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
         eventHub.$on('formatText', (type, updatedText) => {
            if (type === "title")
                this.review.reviewTitle = updatedText;
            else this.review.reviewContent = updatedText;
        });
         eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        review() {
            if (this.review) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the review!");
            }
        }
    },
    mounted: async function() {
        this.review = await getResourceJson('http://localhost:8080/getReview?rId=' + this.$route.query.rId);
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    components: {
        'Notifications': Notifications,
        'FormatToolbar': FormatToolbar,
        'StatusAlerts': StatusAlerts
    }
}
</script>