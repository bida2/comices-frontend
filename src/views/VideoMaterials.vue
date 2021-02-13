<template>
    <div class="videoMaterials">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (videos != null && videos != undefined)">
            <h1 class="text-center primary--text font-weight-bold">Video Materials</h1>
            <Notifications></Notifications>
            <v-row justify="center" v-for="video in videos.content" :key="video.vMaterialId">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">{{ video.subtitleHeader }}</h3>
                    <v-subheader class="justify-center mt-xl-n3">Posted on {{video.timePostedFormatted}}</v-subheader>
                    <!-- ?autoplay=1&enable_js=1 allow us to use the autoplay feature properly - 4/30/2020 -->
                    <v-subheader class="justify-center mt-xl-n3">{{video.description}}</v-subheader>
                    <iframe v-if="video.embedUrl.includes('youtube')" width="570" height="460" :src="video.embedUrl" frameborder="0" :srcdoc="'<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=' + video.embedUrl + '?autoplay=1&enable_js=1&mute=1><img src=' + video.thumbnail + '><span  style=background-color:rgba(255,0,0,0.8);left:45%;border-radius:35%;width:70px;>▶</span></a>'" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                    <iframe v-else :src="video.embedUrl" width="570" height="266" frameborder="0" allowfullscreen></iframe>
                    <div class="text-center border-solid-2px" v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                        <h4 class="pa-xl-2 primary white--text">Video Material Actions Toolbar</h4>
                        <v-divider class="mb-xl-2"></v-divider>
                        <div class="mb-xl-3">
                            <v-btn @click="removeVideoMaterial(video.vMaterialId, headers)" icon>
                                <v-icon>mdi-close-circle</v-icon>
                            </v-btn>
                            <v-btn :to="'/editVideoMaterial?vId=' + video.vMaterialId" icon>
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn to="/addVideoMaterial" icon>
                                <v-icon>mdi-plus-circle</v-icon>
                            </v-btn>
                        </div>
                    </div>
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
        videos: null,
        valid: false,
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        resourceLoaded: false
    }),
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
        videos() {
            if (this.videos) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the videos!");
            }
        }
    }
    ,
    mounted: async function() {
        this.videos = await getResourceJson('http://localhost:8080/getVideoPage');
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        removeVideoMaterial(videoId, headers) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/removeVideoMaterial?vId=' + videoId, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(async function(message) {
                        eventHub.$emit('notifyUser', message);
                        this.videos = await getResourceJson('http://localhost:8080/getVideoPage');
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "Cannot delete comic!");
            }
        }
    },
    components: {
        'Notifications': Notifications,
        'StatusAlerts': StatusAlerts
    }
}
</script>