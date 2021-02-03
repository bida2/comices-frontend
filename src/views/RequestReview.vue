<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 12/1/2020 -->
<template>
    <div class="requestReview">
        <v-container class="text-center">
            <StatusAlerts></StatusAlerts>
           <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && loading === false" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Request A Comic Review</h3>
                    <v-form  id="comic-form" @submit.prevent="submitComic(headers)" ref="requestreviewform" class="text-center" v-model="valid">
                        <v-text-field :rules="comicNameRules" name="comicName" label="Comic Name" required></v-text-field>
                        <v-text-field :rules="urlRules" name="comicSummaryURL" label="Link To Comic Summary" required></v-text-field>
                        <v-text-field :rules="urlRules" name="comicCoverURL" label="Link To Comic Cover" required></v-text-field>
                        <v-btn type="submit" text class="primary">Request</v-btn>
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
import StatusAlerts from '@/components/StatusAlerts.vue'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
import { notEmpty, validUrl, comicBookName } from '@/validations.js'
export default {
    data: () => ({
        modal: false,
        valid: false,
        headers: new Headers(),
        csrfToken: '',
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        loading: true,
        comicNameRules: [
            comicBookName,
            notEmpty
        ],
        urlRules: [
            notEmpty,
            validUrl
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
            if (!this.$refs.requestreviewform.validate()) {
                //this.toggleAlert("Data is missing or in an incorrect format! Please review your entered data and try again!");
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            if (this.accessTokenDecoded !== null) {
                const formElement = document.getElementById('comic-form');
                fetch('http://localhost:8080/requestReview', {
                        method: 'POST',
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
                        this.$refs.requestreviewform.reset();
                    }.bind(this))
            } else {
                //this.toggleAlert("Access denied! Cannot request a comic review!");
                eventHub.$emit("notifyUser", "Access denied! Cannot request a comic review!");
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
        readyHandler(); // in case the component has been instantiated lately after loading
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
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications
    }
}
</script>