<template>
    <div class="assetUploader">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')) && (files != null && files != undefined)">
            <Notifications></Notifications>
            <h3 class="text-center primary--text mt-xl-5 mb-xl-4 font-weight-light">Download Uploaded Files</h3>
            <v-row v-for="(file, filename) in files" justify="center" :key="filename">
                <v-col v-for="(date,index) in file" cols="12" md="6" xl="3" :key="index">
                    <p>{{ filename }}</p>
                    <p class="mb-xl-0 grey-card-like-text caption">Created: {{ date[0] }}</p>
                    <p class="grey-card-like-text caption">Modified: {{ date[1] }} </p>
                </v-col>
                <v-col cols="12" md="6" xl="3" class="text-right">
                    <v-btn @click="downloadFile(headers, filename)" color="primary">Download</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJsonWithHeaders } from '@/common.js'
export default {
    data: () => ({
        files: null,
        valid: false,
        headers: new Headers(),
        resourceLoaded: false,
        accessTokenEncoded: '',
        accessTokenDecoded: null,
    }),
    methods: {
        downloadFile(headers, filename) {
            if ((!filename || 0 === filename.length) || typeof filename !== "string") {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            fetch('http://localhost:8080/downloadFile?name=' + filename, {
                    method: 'GET',
                    headers,
                    credentials: 'include'
                })
                .then(function(response) {
                    if (response.status >= 400) {
                        return response.text();
                    } else return response.blob();
                }).then(function(blob) {
                    eventHub.$emit("notifyUser", "Download in progress...");
                    if (typeof blob !== "string") {
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', filename);
                        document.body.appendChild(link);
                        link.click();
                    } else {
                        eventHub.$emit("notifyUser", blob);
                    }

                }.bind(this))
        },
    },
    watch: {
        files() {
            if (this.files) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the files!");
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
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
        this.files = await getResourceJsonWithHeaders('http://localhost:8080/getFiles', this.headers);
    },
    components: {
        'Notifications': Notifications,
        'StatusAlerts': StatusAlerts
    }
}
</script>