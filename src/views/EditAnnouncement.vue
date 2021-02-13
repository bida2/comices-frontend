<template>
    <div id="my-cont" class="editAnnouncement">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (announcement != null && announcement != undefined)">
            <Notifications></Notifications>
            <FormatToolbar></FormatToolbar>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit An Announcement</h3>
                    <v-form id="ann-form" @submit.prevent="submitAnnouncement(headers)" class="text-center" v-model="valid" ref="editannform">
                        <v-text-field id="ann-title" name="annTitle" :rules="annTitleRules" :value="announcement.annTitle" label="Announcement Title"></v-text-field>
                        <v-textarea id="ann-content" name="annContent" :rules="annContRules" :value="announcement.annContent" label="Announcement Content" auto-grow required></v-textarea>
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
import { notEmpty, descLength } from '@/validations.js'
export default {
    data: () => ({
        announcement: null,
        valid: false,
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        resourceLoaded: false,
        annTitleRules: [
            notEmpty
        ],
        annContRules: [
            notEmpty,
            descLength
        ]
    }),
    methods: {
        submitAnnouncement(headers) {
            if (!this.$refs.editannform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('ann-form');
            fetch('http://localhost:8080/editAnnouncement?aId=' + this.$route.query.aId, {
                    method: 'PUT',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    return response.text()
                }).then(async function(jsonResponse) {
                    eventHub.$emit("notifyUser", jsonResponse);
                    this.announcement = await getResourceJson('http://localhost:8080/getAnnouncement?aId=' + this.$route.query.aId);
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
                this.announcement.annTitle = updatedText;
            else this.announcement.annContent = updatedText;
        });
        eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        announcement() {
            if (this.announcement) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the files!");
            }
        }
    },
    mounted: async function() {
        this.announcement = await getResourceJson('http://localhost:8080/getAnnouncement?aId=' + this.$route.query.aId);
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