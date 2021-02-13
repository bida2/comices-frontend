<template>
    <div class="videoMaterials">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (video != null && video != undefined)">
       <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit A Video Material</h3>
                    <v-form id="video-form" @submit.prevent="submitMaterial(headers)" class="text-center" ref="videoeditform" v-model="valid">
                        <v-text-field name="videoHeader" :rules="headerRules" :value="video.subtitleHeader" label="Video Header"></v-text-field>
                        <v-textarea name="videoContent" :rules="videoRules" :value="video.description" label="Description" auto-grow required></v-textarea>
                        <v-text-field name="embedUrl" :rules="urlRules" :value="video.embedUrl" label="Embed URL"></v-text-field>
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
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
import { notEmpty, validUrl, descLength } from '@/validations.js'
export default {
    data: () => ({
        video: null,
        valid: false,
        headers: new Headers(),
        resourceLoaded: false,
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        headerRules: [
            notEmpty
        ],
        videoRules: [
            notEmpty,
            descLength
        ],
        urlRules: [
            notEmpty,
            validUrl
        ]
    }),
    methods: {
        submitMaterial(headers) {
            if (!this.$refs.videoeditform.validate()) {
              eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('video-form');
            fetch('http://localhost:8080/editVideo?vId=' + this.$route.query.vId, {
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
        video() {
            if (this.video) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the video material!");
            }
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
    mounted: async function() {
        this.video = await getResourceJson('http://localhost:8080/getVideo?vId=' + this.$route.query.vId);
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