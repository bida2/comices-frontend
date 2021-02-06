<template>
    <div class="editComic">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="comic != null && comic != undefined">
            <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit Comic Info</h3>
                    <v-form id="comic-form" @submit.prevent="submitComic(headers)" class="text-center" v-model="valid" ref="editcomicform">
                        <v-text-field name="comicName" label="Comic Name" :rules="comicNameRules" :value="comic.comicName" required></v-text-field>
                        <v-select name="releaseStatus" class="mt-xl-5" :items="releaseStatus" :rules="releaseStatusRules" v-model="comic.releaseStatus" label="Release Status" dense required></v-select>
                        <v-text-field name="author" class="mt-xl-5" :rules="authorRules" :value="comic.comicAuthor" label="Author" required></v-text-field>
                        <v-text-field name="comicCoverURL" class="mt-xl-5" :rules="urlRules" :value="comic.comicCoverURL" label="Comic Cover Image URL" required></v-text-field>
                        <v-text-field name="buyComicURL" class="mt-xl-5" :rules="urlRules" :value="comic.buyURL" label="Buy Comic URL" required></v-text-field>
                        <v-text-field name="seriesURL" class="mt-xl-5" :rules="urlRules" :value="comic.seriesURL" label="Series URL" required></v-text-field>
                        <v-text-field name="price" type="number" class="mt-xl-5" :rules="priceRules" :value="comic.price" label="Comic Price" required></v-text-field>
                        <v-textarea name="comicDesc" class="mt-xl-5" :rules="comicDescRules" label="Comic Description" :value="comic.comicDesc" required></v-textarea>
                        <v-btn type="submit" text class="primary">Save Edits</v-btn>
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
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJson } from '@/common.js'
import { onlyLetters, onlyIntegerAndFloatNumbers, notEmpty, validUrl, comicBookName, onlyAcceptedReleaseStatus } from '@/validations.js'
export default {
    data: () => ({
        comic: null,
        valid: false,
        releaseStatus: [{ text: 'Upcoming', value: 'upcoming' }, { text: 'Released', value: 'released' }, { text: 'Classic', value: 'classic' }],
        headers: new Headers(),
        csrfToken: '',
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        comicNameRules: [
            comicBookName,
            notEmpty
        ],
        comicDescRules: [
            notEmpty
        ],
        authorRules: [
            onlyLetters,
            notEmpty
        ],
        urlRules: [
            notEmpty,
            validUrl
        ],
        priceRules: [
            onlyIntegerAndFloatNumbers,
            notEmpty
        ],
        releaseStatusRules: [
            notEmpty,
            onlyAcceptedReleaseStatus
        ]
    }),
    methods: {
        submitComic(headers) {
            if (!this.$refs.editcomicform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                const formElement = document.getElementById('comic-form');
                fetch('http://localhost:8080/editComic?cId=' + this.$route.query.cId, {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        if (message == 'Comic edited successfully!') {
                            this.$router.push("/")
                        } else {
                            eventHub.$emit("notifyUser", message);
                        }
                    }.bind(this))
            } else {
                eventHub.$emit("notifyUser", "Access denied! Cannot submit edits to a comic!");
            }

        }
    },
     watch: {
        comic() {
            if (this.comic) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the comic review!");
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
        this.comic = await getResourceJson('http://localhost:8080/getComicSummary?cId=' + this.$route.query.cId);
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