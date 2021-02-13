<template>
    <div class="editThread">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (thread != null && thread != undefined)">
            <Notifications></Notifications>
             <FormatToolbar></FormatToolbar>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit A Thread</h3>
                    <v-form id="post-form" @submit.prevent="submitThread(headers)" class="text-center" ref="editthreadform" v-model="valid">
                        <v-text-field id="thread-title" name="threadTitle" :rules="threadTitleRules" :value="thread.threadTopic" label="Thread Title"></v-text-field>
                        <v-textarea id="thread-content" name="threadContent" :rules="postRules" :value="thread.threadPosts[0].postContent" label="Thread's First Post" auto-grow required></v-textarea>
                        <v-btn type="submit" text class="primary">Submit Edit</v-btn>
                    </v-form>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import FormatToolbar from '@/components/FormatToolbar.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
import { descLength, notEmpty } from '@/validations.js'
export default {
    data: () => ({
        thread: null,
        valid: false,
        headers: new Headers(),
        resourceLoaded: false,
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        threadTitleRules: [
            notEmpty
        ],
        postRules: [
            notEmpty,
            descLength
        ]
    }),
    methods: {
        submitThread(headers) {
            if (!this.$refs.editthreadform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('post-form');
            fetch('http://localhost:8080/editThread?tId=' + this.$route.query.tId, {
                    method: 'PUT',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    return response.text()
                }).then(function(jsonResponse) {
                    eventHub.$emit("notifyUser", jsonResponse);
                }.bind(this))
        },
    },
       watch: {
        thread() {
            if (this.thread) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the thread!");
            }
        }
    },
    created: async function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
          eventHub.$on('formatText', (type, updatedText) => {
            if (type === "title")
                this.thread.threadTopic = updatedText;
            else this.thread.threadPosts[0].postContent = updatedText;
        });
          eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    mounted: async function() {
        this.thread = await getResourceJson('http://localhost:8080/getThread?tId=' + this.$route.query.tId);
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