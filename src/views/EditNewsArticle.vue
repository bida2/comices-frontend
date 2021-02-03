<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 11/30/2020 -->
<template>
    <div class="editComic">
        <!-- Remove what is necessary but basically re-use a good chunk of the code here. the below code is a good start -->
        <v-container>
        <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit News Article</h3>
                    <v-form id="comic-form" @submit.prevent="submitArticle(headers)" class="text-center" v-model="valid" ref="editnewsarticle">
                        <v-text-field name="title" :value="article.newsArticleTitle" label="News Article Title" required></v-text-field>
                        <v-textarea name="content" :rules="articleContentRules" :value="article.newsArticleContent" label="News Article Content" required></v-textarea>
                        <v-btn type="submit" text class="primary">Save</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="!accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col class="ma-0 pa-0" cols="12" md="6" xl="4">
                    <v-alert class="ma-0" type="error" transition="slide-x-transition">
                        Access denied! Insufficient privileges!
                    </v-alert>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
import { notEmpty, descLength } from '@/validations.js'
export default {
    data: () => ({
        article: {},
        valid: false,
        headers: new Headers(),
        csrfToken: '',
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        articleContentRules: [
            notEmpty,
            descLength
        ]
    }),
    methods: {
        submitArticle(headers) {
            if (!this.$refs.editnewsarticle.validate()) {
                //this.toggleAlert("Data is missing or in an incorrect format! Please review your entered data and try again!");
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                const formElement = document.getElementById('comic-form');
                fetch('http://localhost:8080/editNewsArticle?aId=' + this.$route.query.aId, {
                        method: 'PUT',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        //this.toggleAlert(message);
                        eventHub.$emit("notifyUser", message);
                    }.bind(this))
            } else {
                //this.toggleAlert("Access denied! Cannot submit edits to a comic!");
                 eventHub.$emit("notifyUser", "Access denied! Cannot submit edits to a comic!");
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
        this.article = await getResourceJson('http://localhost:8080/getNewsArticle?aId=' + this.$route.query.aId);
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