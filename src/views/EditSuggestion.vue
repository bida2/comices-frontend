<template>
    <div class="suggestComic">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true && (suggestion != null && suggestion != undefined)">
         <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Edit Suggested Comic</h3>
                    <v-form id="comic-form" @submit.prevent="submitComic(headers)" class="text-center" v-model="valid" ref="editsuggestionform">
                        <v-text-field name="comicName" :rules="comicNameRules" label="Suggested Comic Name" :value="suggestion.suggestedComicName" required></v-text-field>
                        <v-text-field name="authorName" :rules="authorRules" label="Suggested Author Name" :value="suggestion.suggestedAuthorName" required></v-text-field>
                        <v-text-field name="buyURL" :rules="urlRules" label="URL To Buy Comic" :value="suggestion.buyComicURL" required></v-text-field>
                        <v-text-field name="coverURL" :rules="urlRules" label="Comic Cover URL" :value="suggestion.comicCoverURL" required></v-text-field>
                        <v-dialog ref="dialog" v-model="modal" :return-value.sync="date" persistent width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="suggestion.suggestedReleaseDate" label="Release date" name="comicReleaseDate" readonly v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="suggestion.suggestedReleaseDate" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="modal = false">Cancel</v-btn>
                                <v-btn text color="primary" @click="$refs.dialog.save(date)">OK</v-btn>
                            </v-date-picker>
                        </v-dialog>
                        <v-btn type="submit" text class="primary">Edit Suggestion</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="!accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col class="ma-0" cols="12" md="6" xl="4">
                    <v-alert class="ma-0" type="error" transition="slide-x-transition">
                        Insufficient priviliges to view this page!
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
import { onlyLetters, notEmpty, validUrl, comicBookName } from '@/validations.js'
export default {
    data: () => ({
        date: new Date().toISOString().substr(0, 10),
        modal: false,
        valid: false,
        suggestion: null,
        resourceLoaded: false,
        headers: new Headers(),
        csrfToken: '',
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        comicNameRules: [
            comicBookName,
            notEmpty
        ]
        ,
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
    }),
    methods: {
        submitComic(headers) {
             if (!this.$refs.editsuggestionform.validate()) {
               eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            } 
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                const formElement = document.getElementById('comic-form');
                fetch('http://localhost:8080/submitSuggestionEdit?id=' + this.$route.query.suggid, {
                        method: 'PUT',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        eventHub.$emit("notifyUser", message);
                    }.bind(this))
            } else {
                eventHub.$emit("notifyUser", "Access denied! Cannot edit comic suggestion!");
            }

        }
    },
     watch: {
        suggestion() {
            if (this.suggestion) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the suggested comic!");
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
        this.suggestion = await getResourceJson('http://localhost:8080/getSuggestion?id=' + this.$route.query.suggid);
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