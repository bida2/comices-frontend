<template>
    <div class="comics">
        <Notifications></Notifications>
        <StatusAlerts></StatusAlerts>
        <v-container fluid class="my-5" v-if="resourceLoaded == true && (news != null && news != undefined && news.content.length > 0)">
            <h3 class="text-center primary--text  font-weight-light">Comic Book News</h3>
            <v-row justify="center" v-for="article in news.content" :key="article.newsId">
                <v-col cols="12" md="6" xl="4">
                    <v-skeleton-loader :loading="loading" transition="slide-x-transition" type="card">
                        <v-card max-height="300" max-width="600" v-show="!loading">
                            <v-card-title class="headline">{{ article.newsArticleTitle }}</v-card-title>
                            <v-card-subtitle class="mt-xl-n4">Posted on {{ article.newsArticleFormattedDate}} </v-card-subtitle>
                            <v-card-text>
                                {{ article.newsArticleContent }}
                            </v-card-text>
                            <v-card-actions>
                                <v-btn text>
                                    <router-link class="announce-title" :to="'/newsArticle?aId=' + article.newsId">Read Now</router-link>
                                </v-btn>
                                <v-btn v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" text>
                                    <router-link class="warning--text announce-title" :to="'/editNewsArticle?aId=' + article.newsId">Edit Article</router-link>
                                </v-btn>
                                <v-btn class="red--text announce-title" @click="deleteArticle(article.newsId, headers)" text>
                                   Delete Article
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-skeleton-loader>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import StatusAlerts from '@/components/StatusAlerts.vue'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, setUserToken, getResourceJson } from '@/common.js'
export default {
    data: () => ({
        news: null,
        loading: true,
        loaded: false,
        announceCard: true,
        accessTokenEncoded: '',
        resourceLoaded: false,
        loggedInUser: null,
        headers: '',
        accessTokenDecoded: null,
    }),
    components: {
        'Notifications': Notifications,
        'StatusAlerts': StatusAlerts,
    },
    watch: {
        news() {
            if (!this.news) {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the news articles!");
            }
            else if (!this.news.empty) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "No news articles available!");
            }
        }
    },
    created: async function() {
        const readyHandler = () => {
            if (document.readyState == 'complete') {
                setTimeout(() => {
                    this.loading = false;
                    this.loaded = true;
                    document.removeEventListener('readystatechange', readyHandler);
                }, 1000);
            }
        };
        document.addEventListener('readystatechange', readyHandler);
        readyHandler(); // in case the component has been instantiated lately after loading
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
        }.bind(this));
        eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    mounted: async function() {
        this.news = await getResourceJson('http://localhost:9000/getAllNews');
        this.headers = new Headers({
            'X-XSRF-TOKEN': getToken()
        })
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers = setUserToken(this.headers, this.accessTokenEncoded)
        this.truncContent(15, 6);
    },
    methods: {
         truncContent(contentWordLimit, titleWordLimit) {
        // If the title of the revuew is over a chosen content word limit - truncate it to the limit, add ... at end of title
            // If the review's content is over a chosen title word limit - truncate it to the limit, add ... at the end
            this.news.content.forEach((article) => {
                let splitContent = article.newsArticleContent.split(" ");
                let splitTitle = article.newsArticleTitle.split(" ");
                if (splitContent.length > contentWordLimit) {
                    splitContent.splice(contentWordLimit, splitContent.length - contentWordLimit, '');
                   article.newsArticleContent = splitContent.join(" ") + "...";
                }
                if (splitTitle.length > titleWordLimit) {
                    splitTitle.splice(titleWordLimit, splitTitle.length - titleWordLimit, '');
                    article.newsArticleTitle = splitTitle.join(" ") + "...";
                }

            });
       },
       deleteArticle(articleId, headers) {
        if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/delArticle?aId=' + articleId, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(async function(message) {
                        eventHub.$emit('notifyUser', message);
                        this.news = await getResourceJson('http://localhost:9000/getAllNews');
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "Cannot delete comic!");
            }
       }
    }
}
</script>