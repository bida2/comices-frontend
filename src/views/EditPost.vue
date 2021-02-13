<template>
    <div class="editPost">
         <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (post != null && post != undefined)">
            <Notifications></Notifications>
            <FormatToolbar></FormatToolbar>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit your post below</h3>
                    <v-form id="post-form" @submit.prevent="submitPost(headers)" class="text-center" v-model="valid" ref="editpostform">
                        <v-text-field id="post-title" name="title" :value="post.postTitle" label="Post Title"></v-text-field>
                        <v-textarea id="post-content" name="content" :rules="postRules" :value="post.postContent" auto-grow required></v-textarea>
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
import { notEmpty, postLength } from '@/validations.js'
export default {
    data: () => ({
        post: null,
        valid: false,
        headers: new Headers(),
        resourceLoaded: false,
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        postRules: [
            notEmpty,
            postLength
        ]
    }),
    methods: {
        submitPost(headers) {
            if (!this.$refs.editpostform.validate()) {
               eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('post-form');
            fetch('http://localhost:8080/editPost?pId=' + this.$route.query.pId, {
                    method: 'PUT',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    return response.text()
                }).then(function(jsonResponse) {
                   eventHub.$emit("notifyUser", jsonResponse);
                    if (jsonResponse != "Post content is empty!")
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
                this.post.postTitle = updatedText;
            else this.post.postContent = updatedText;
        });
         eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        post() {
            if (this.post) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the post!");
            }
        }
    },
    mounted: async function() {
        this.post = await getResourceJson('http://localhost:8080/getPost?pId=' + this.$route.query.pId);
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