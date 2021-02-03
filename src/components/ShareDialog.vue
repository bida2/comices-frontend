<template>
    <v-dialog v-model="comicShareInfo" width="500">
        <v-card>
            <v-card-actions class="pa-xl-0 pa-lg-0">
                <strong class="pl-xl-4">Share This Comic</strong>
                <v-spacer></v-spacer>
                <v-btn @click="comicShareInfo = !comicShareInfo" icon>
                    <v-icon>mdi-close-circle</v-icon>
                </v-btn>
            </v-card-actions>
            <v-list-item two-line>
                <v-list-item-content>
                    <v-img height="200" width="200" :src="shareComic.comicCoverURL"></v-img>
                    <v-list-item-title class="announce-title-size mt-xl-3 mb-xl-1">
                        {{ shareComic.comicName }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="announce-subtitle-size">{{ shareComic.comicDesc }}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <!-- For testing the sharing options, use ngrok - login with your github account and follow the instructions
                    The given tunneling URL is never the same - every time you run ngrok you're gonna have to change the URL by hand - this is needed
                    only for Facebook for now !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!-->
            <ShareNetwork class="pl-xl-4 no-deco-link v-btn v-btn--flat theme--light v-size--default" network="twitter" :url="domainName + '/summary?cId=' + shareComic.comicId" :title="shareComic.comicName" :description="shareComic.comicDesc">
                <v-icon color="info">{{ icons['twitter'] }}</v-icon>
            </ShareNetwork>
            <ShareNetwork class="pl-xl-4 no-deco-link v-btn v-btn--flat theme--light v-size--default" network="reddit" :url="domainName + '/summary?cId=' + shareComic.comicId" :title="shareComic.comicName" :description="shareComic.comicDesc">
                <v-icon color="rgb(255,69,0)">{{ icons['reddit'] }}</v-icon>
            </ShareNetwork>
            <ShareNetwork class="pl-xl-4 no-deco-link v-btn v-btn--flat theme--light v-size--default" network="pinterest" :url="domainName + '/summary?cId=' + shareComic.comicId" :title="shareComic.comicName" :description="shareComic.comicDesc">
                <v-icon color="#e60023">{{ icons['pinterest'] }}</v-icon>
            </ShareNetwork>
        </v-card>
    </v-dialog>
</template>
<script>
import eventHub from '@/main.js'
import { mdiTwitter, mdiReddit, mdiPinterest } from '@mdi/js'
export default {
    data: () => ({
        domainName: window.location.origin,
        comicShareInfo: false,
        shareComic: {},
         icons: { 'twitter': mdiTwitter, 'reddit': mdiReddit, 'pinterest': mdiPinterest }
    }),
    mounted: async function() {
    	eventHub.$on('toggleShareDialog', (comic) => {
    		this.shareComic = comic;
    		this.comicShareInfo = !this.comicShareInfo;
    	});
    }
}
</script>