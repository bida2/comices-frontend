<template>
    <div class="addVideoMaterial">
        <v-container>
            <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Add A Video Material</h3>
                    <v-form id="video-form" @submit.prevent="submitVideo(headers)" class="text-center" ref="videoform">
                        <v-text-field name="videoTitle" :rules="videoNameRules" label="Video Material Name" required></v-text-field>
                        <v-text-field name="embedUrl" :rules="urlRules" label="Video Material Embed URL" required></v-text-field>
                        <v-text-field name="thumbUrl" :rules="urlRules" label="Video Material Thumbnail URL (YouTube only) (Optional)"></v-text-field>
                        <v-textarea name="description" :rules="descRules" label="Video Material Description" required></v-textarea>
                        <v-btn type="submit" text class="primary">Save Video</v-btn>
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
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
import { notEmpty, validUrl } from '@/validations.js'
export default {
    data: () => ({
        headers: new Headers(),
        csrfToken: '',
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        videoNameRules: [
           notEmpty
        ],
        descRules: [
            notEmpty
        ],
        authorRules: [
            validUrl,
            notEmpty
        ],
    }),
    methods: {
        submitVideo(headers) {
            if (!this.$refs.videoform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                const formElement = document.getElementById('video-form');
                fetch('http://localhost:8080/addVideo', {
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
                        if (!message.includes("already exists"))
                            this.$refs.videoform.reset();
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "Access denied! Cannot submit new video material!");
            }

        }
    },
    created: async function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
    },
    mounted: async function() {
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    components: {
        "Notifications": Notifications
    }
}
</script>