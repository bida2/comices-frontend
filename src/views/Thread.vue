<template>
    <div class="newThread">
        <v-container>
           <Notifications></Notifications>
            <v-row justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Create a Thread</h3>
                    <v-form id="thread-form" @submit.prevent="submitPost(headers)" ref="threadform" class="text-center" v-model="valid">
                        <v-text-field name="threadTitle" :rules="threadNameRules" label="Thread Title"></v-text-field>
                        <v-textarea name="threadPostContent" :rules="postRules" auto-grow required></v-textarea>
                        <v-btn type="submit" text class="primary">Post</v-btn>
                    </v-form>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import Router from 'vue-router'
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
import { threadTitleLength, postLength, notEmpty } from '@/validations.js'
export default {
    data: () => ({
        valid: false,
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        threadNameRules: [
           notEmpty,
            threadTitleLength
        ],
        postRules: [
           notEmpty,
           postLength
        ]
    }),
    methods: {
        submitPost(headers) {
            if (!this.$refs.threadform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('thread-form');
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/addThread', {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        if (message == 'Thread added successfully!') {
                            this.$router.push("/forums")
                        } else {
                            eventHub.$emit("notifyUser", message);
                        }
                    }.bind(this))
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
        'Notifications': Notifications
    }
}
</script>