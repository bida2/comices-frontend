<template>
    <div class="newsArticle">
        <v-container>
            <Notifications></Notifications>
            <v-row justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">{{ article.newsArticleTitle }}</h3>
                    <v-subheader class="justify-center mt-xl-n3">Posted on {{article.newsArticleFormattedDate}}</v-subheader>
                    <p class="text-center mt-xl-4">{{article.newsArticleContent}}</p>
                    <iframe v-if="article.videoMaterialURL" width="560" height="315" :src="article.videoMaterialURL" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <h4 class="text-center primary--text font-weight-bold mt-xl-5 pa-xl-3">Did you like this news article? Vote below!</h4>
                    <div class="text-center">
                        <v-btn @click="giveThumbs('Up', article.newsId, headers)" icon>
                            <v-icon>mdi-thumb-up</v-icon>
                            <span class="ml-xl-1">{{ article.thumbsUp }}</span>
                        </v-btn>
                        <v-btn @click="giveThumbs('Down', article.newsId, headers)" class="ml-xl-3" icon>
                            <v-icon>mdi-thumb-down</v-icon>
                            <span class="ml-xl-1">{{ article.thumbsDown }}</span>
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import Router from 'vue-router'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        article: {},
        valid: false,
        headers: new Headers(),
        accessTokenEncoded: '',
        loggedInUser: null,
        accessTokenDecoded: null,
    }),
    created: async function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this))
    },
    mounted: async function() {
        this.article = await getResourceJson('http://localhost:8080/getNewsArticle?aId=' + this.$route.query.aId);
        this.loggedInUser = await this.$auth.getUser();
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        giveThumbs(ratingType, annId, headers) {
            fetch('http://localhost:8080/rateArticle?u=' + this.loggedInUser.sub + '&aId=' + annId + "&r=" + ratingType, {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                })
                .then(function(response) {
                    return response.text()
                })
                .then(async function(message) {
                    this.article = await getResourceJson('http://localhost:8080/getNewsArticle?aId=' + this.$route.query.aId);
                    // this.toggleAlert(message);
                    eventHub.$emit("notifyUser", message);
                }.bind(this))
        },
    },
    components: {
        "Notifications": Notifications
    }
}
</script>