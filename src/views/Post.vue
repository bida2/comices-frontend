<template>
    <div class="forumPost">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="posts != null && posts != undefined">
            <Notifications></Notifications>
            <v-row>
                <v-col v-if="posts[0].status != 400" cols="12" md="6" lg="12" xl="12">
                    <v-card v-for="post in posts" :key="post.postId" class="mx-auto my-xl-2" max-width="600" outlined>
                        <v-skeleton-loader :loading="!fullyLoaded" transition="slide-x-transition" type="list-item-three-line">
                            <v-list-item three-line v-show="fullyLoaded">
                                <v-list-item-content>
                                    <v-list-item-title class="post-title headline mb-1" v-html="post.postTitle">
                                    </v-list-item-title>
                                    <v-list-item-subtitle>Posted on {{ post.postDateTimeFormatted }}</v-list-item-subtitle>
                                    <p class="my-xl-2 post-content" v-html="post.postContent"></p>
                                    <div v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" class="text-right">
                                        <v-btn text max-width="120" @click="deletePost(post.postId, headers)" color="error">Delete Post</v-btn>
                                        <v-btn text max-width="120" :to="'/editPost?pId=' + post.postId" color="primary">Edit Post</v-btn>
                                    </div>
                                </v-list-item-content>
                            </v-list-item>
                        </v-skeleton-loader>
                    </v-card>
                </v-col>
            </v-row>
            <v-row v-if="accessTokenEncoded !== undefined" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Comment on this thread:</h3>
                    <v-form id="post-form" @submit.prevent="submitPost(headers)" class="text-center" v-model="valid" ref="postform">
                        <v-text-field name="postTitle" label="Post Title"></v-text-field>
                        <v-textarea id="test" name="postContent" :rules="postRules" auto-grow required></v-textarea>
                        <v-btn type="submit" text class="primary">Post</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-else justify="center">
                <v-col class="text-center" cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">You need to login in order to post!</h3>
                    <v-btn type="submit" @click="handleLogin" text class="mt-xl-2 primary">Login</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import Router from 'vue-router'
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        posts: null,
        valid: false,
        fullyLoaded: false,
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        postRules: [
            v => !!v || 'Post cannot be empty!',
            v => (!!v && v.length <= 600) || 'Too many characters in post - maximum allowed is 600!'
        ]
    }),
    methods: {
        handleLogin() {
            this.$auth.loginRedirect(this.$route.fullPath);
        },
        submitPost(headers) {
            if (!this.$refs.postform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('post-form');
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/addPost?tId=' + this.$route.query.tId, {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        if (response.status >= 400)
                            return response.text();
                        return response.json();
                    }).then(function(jsonResponse) {
                        if (typeof jsonResponse === "string")
                            // this.toggleAlert(jsonResponse);
                            eventHub.$emit("notifyUser", jsonResponse);
                        else this.posts = jsonResponse;
                    }.bind(this))
            }
        },
        deletePost(postId, headers) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/delPost?pId=' + postId, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include'
                    })
                    .then(function(response) {
                        return response.text()
                    }).then(async function(responseText) {
                        eventHub.$emit("notifyUser", responseText);
                        this.posts = await getResourceJson('http://localhost:8080/getPosts?tId=' + this.$route.query.tId);
                    }.bind(this))
            }
        }
    },
    watch: {
        posts() {
            if (this.posts) {
                if (this.posts.length > 0) {
                    eventHub.$emit('changeStatusAlert', false, null, null);
                    setTimeout(() => {
                        this.fullyLoaded = true;
                    }, 1000);
                }
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the post!");
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
        this.posts = await getResourceJson('http://localhost:8080/getPosts?tId=' + this.$route.query.tId);
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    components: {
        'Notifications': Notifications,
        'StatusAlerts': StatusAlerts
    }
}
</script>