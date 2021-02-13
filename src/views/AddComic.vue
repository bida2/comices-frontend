<template>
    <div class="addUpcomingComic">
        <v-container fluid class="text-center my-5">
            <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Add A Comic Book</h3>
                    <v-form id="comic-form" @submit.prevent="submitComic(headers)" class="text-center" ref="form">
                        <v-text-field class="mb-xl-4" name="comicName" :rules="comicNameRules" label="Comic Name" dense required></v-text-field>
                        <v-select name="releaseStatus" :items="releaseStatus" v-model="relStatusOption" label="Release Status"  required></v-select>
                        <v-text-field class="mb-xl-2 mt-xl-n3" name="author" :rules="authorRules" label="Author" required></v-text-field>
                        <v-text-field class="mb-xl-2" name="comicCoverURL" :rules="urlRules" label="Comic Cover Image URL" required></v-text-field>
                        <v-text-field class="mb-xl-2" name="seriesURL" :rules="urlRules" label="Comic Series URL" required></v-text-field>
                        <v-text-field class="mb-xl-2" type="number" :rules="priceRules" name="price" label="Comic Price" required></v-text-field>
                        <v-text-field class="mb-xl-2" name="buyComicURL" :rules="urlRules" label="Buy Comic URL" required></v-text-field>
                        <v-textarea class="mb-xl-2" name="comicDesc" :rules="comicDescRules" label="Comic Description" required></v-textarea>
                        <v-btn type="submit" text class="primary">Save Comic</v-btn>
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
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
import { onlyLetters, onlyIntegerAndFloatNumbers, notEmpty, validUrl, comicBookName } from '@/validations.js'
export default {
    data: () => ({
        releaseStatus: ['Upcoming', 'Released', 'Classic'],
        headers: new Headers(),
        csrfToken: '',
        classStatus: 'False',
        submittedForm: false,
        relStatusOption: '',
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
        ]
    }),
    components: {
        'Notifications': Notifications
    },
    methods: {
        submitComic(headers) {
            if (!this.$refs.form.validate()) {
                eventHub.$emit('notifyUser', "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                const formElement = document.getElementById('comic-form');
                fetch('http://localhost:8080/addComic', {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(function(message) {
                        eventHub.$emit('notifyUser', message);
                        if (!message.includes("already exists"))
                            this.$refs.form.reset();
                    }.bind(this))
            } else {
                eventHub.$emit('notifyUser', "Access denied! Cannot submit new comic!");
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
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    }
}
</script>