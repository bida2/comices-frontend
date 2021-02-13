<template>
    <div class="suggestComic">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="resourceLoaded == true">
           <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && loading === false" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Suggest A Comic</h3>
                    <v-form id="comic-form" @submit.prevent="submitComic(headers)" ref="suggestcomicform" class="text-center" v-model="valid">
                        <v-text-field name="comicName" :rules="comicNameRules" label="Suggested Comic Name" required></v-text-field>
                        <v-text-field name="authorName" :rules="authorRules" label="Suggested Author Name" required></v-text-field>
                        <v-text-field name="buyURL" :rules="urlRules" label="URL To Buy Comic" required></v-text-field>
                        <v-text-field type="number" :rules="priceRules" name="price" label="Comic Price" required></v-text-field>
                        <v-text-field name="seriesURL" :rules="urlRules" label="Series URL" required></v-text-field>
                        <v-text-field name="coverURL" :rules="urlRules" label="Comic Cover URL" required></v-text-field>
                        <v-dialog ref="dialog" v-model="modal" :return-value.sync="date" persistent width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="date" label="Release date" name="comicReleaseDate" readonly v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="date" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="modal = false">Cancel</v-btn>
                                <v-btn text color="primary" @click="$refs.dialog.save(date)">OK</v-btn>
                            </v-date-picker>
                        </v-dialog>
                        <v-btn type="submit" text class="primary">Suggest Comic</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="!accessTokenDecoded.groups.includes('users') && loading === false" justify="center">
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
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
import { onlyLetters, onlyIntegerAndFloatNumbers, notEmpty, validUrl, comicBookName } from '@/validations.js'
export default {
    data: () => ({
        date: new Date().toISOString().substr(0, 10),
        modal: false,
        valid: false,
        headers: new Headers(),
        loading: true,
        csrfToken: '',
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        resourceLoaded: false,
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
        ]
    }),
    watch: {
        loading() {
            if (this.loading === false) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            }
        }
    },
    methods: {
        submitComic(headers) {
            if (!this.$refs.suggestcomicform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            if (this.accessTokenDecoded !== null) {
                const formElement = document.getElementById('comic-form');
                fetch('http://localhost:8080/addComicSuggestion?u=' + this.accessTokenDecoded.sub, {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        eventHub.$emit("notifyUser", message);
                        this.$refs.suggestcomicform.reset();
                    }.bind(this))
            } else {
               eventHub.$emit("notifyUser", "Access denied! Cannot submit new comic suggestion!");
            }

        },
    },
    created: async function() {
        const readyHandler = () => {
            if (document.readyState == 'complete') {
                setTimeout(() => {
                    this.loading = false;
                }, 1000);

                document.removeEventListener('readystatechange', readyHandler);
            }
        };
        document.addEventListener('readystatechange', readyHandler);
        readyHandler(); 
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
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications
    }
}
</script>