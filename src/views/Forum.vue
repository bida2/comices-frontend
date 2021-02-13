<template>
    <div class="forums">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (threads != null && threads != undefined)">
            <Notifications></Notifications>
            <v-row>
                <v-col cols="12" md="6" lg="12" xl="12">
                    <v-card v-for="thread in threads" :key="thread.threadId" class="mx-auto my-lg-3 my-xl-2" max-width="600" outlined>
                        <v-skeleton-loader :loading="!fullyLoaded" transition="slide-x-transition" type="list-item-three-line">
                            <v-list-item three-line v-show="fullyLoaded">
                                <v-list-item-content>
                                    <v-list-item-title class="headline mb-1">
                                        <router-link class="no-deco-wo-hover thread-title" :to="'/thread?tId=' + thread.threadId" v-html="thread.threadTopic"></router-link>
                                    </v-list-item-title>
                                    <v-list-item-subtitle>Posted on {{ thread.threadDateTimeFormatted }}</v-list-item-subtitle>
                                    <p v-html="thread.threadPosts[0].postContent"></p>
                                    <div v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" class="text-right">
                                        <v-btn text max-width="120" :to="'/editThread?tId=' + thread.threadId" color="warning">Edit Thread</v-btn>
                                        <v-btn text max-width="120" @click="deleteThread(thread.threadId)" color="error">Delete Thread</v-btn>
                                    </div>
                                </v-list-item-content>
                            </v-list-item>
                        </v-skeleton-loader>
                    </v-card>
                    <v-skeleton-loader class="d-flex justify-center" :loading="!fullyLoaded" transition="slide-x-transition" type="button">
                        <div v-if="accessTokenDecoded !== null" class="text-center">
                            <v-btn depressed v-show="fullyLoaded" to="/createThread" color="primary">New Thread</v-btn>
                        </div>
                        <div v-else class="text-center">
                            <h3 class="text-center primary--text mt-xl-5 font-weight-light">You need to login in order to post a thread!</h3>
                            <v-btn depressed v-show="fullyLoaded" @click="handleLogin" class="mt-xl-2" color="primary">Login</v-btn>
                        </div>
                    </v-skeleton-loader>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        threads: null,
        fullyLoaded: false,
        resourceLoaded: false,
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
    }),
    methods: {
        deleteThread(threadId) {
            const headers = this.headers;
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/delThread?tId=' + threadId, {
                        method: 'GET',
                        headers,
                    })
                    .then(function(response) {
                        return response.text()
                    }).then(async function(responseText) {
                        eventHub.$emit("notifyUser", responseText);
                        this.threads = await getResourceJson('http://localhost:8080/getThreads');
                        this.checkThreads(10, 10);
                    }.bind(this))
            }
        },
        handleLogin() {
            this.$auth.loginRedirect(this.$route.fullPath);
        },
        checkThreads(contentWordLimit, titleWordLimit) {
            // If the title of the review is over a chosen content word limit - truncate it to the limit, add ... at end of title
            // If the review's content is over a chosen title word limit - truncate it to the limit, add ... at the end
            this.threads.forEach((thread) => {
                let splitPost = thread.threadPosts[0].postContent.split(" ");
                let splitTitle = thread.threadTopic.split(" ");
                if (splitPost.length > contentWordLimit) {
                    splitPost.splice(contentWordLimit, splitPost.length - contentWordLimit, '');
                    thread.threadPosts[0].postContent = splitPost.join(" ") + "... " + "<a class='no-deco-wo-hover' href='/thread?tId=" + thread.threadId + "'>Read More</a>";
                }
                if (splitTitle.length > titleWordLimit) {
                    splitTitle.splice(titleWordLimit, splitTitle.length - titleWordLimit, '');
                    thread.threadTopic = splitTitle.join(" ") + "...";
                }

            });
        }
    },
    created: async function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
        eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        threads() {
            if (this.threads) {
                if (this.threads.length > 0 && !this.fullyLoaded) {
                    eventHub.$emit('changeStatusAlert', false, null, null);
                    setTimeout(() => {
                        this.fullyLoaded = true;
                    }, 1000);
                }
            } else {
                eventHub.$emit('changeStatusAlert', false, null, 'Something went wrong while retrieving the forum threads!');
            }

        }
    },
    mounted: async function() {
        this.threads = await getResourceJson('http://localhost:8080/getThreads');
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
        this.checkThreads(10, 6);
    },
    components: {
        'Notifications': Notifications,
        'StatusAlerts': StatusAlerts
    }
}
</script>