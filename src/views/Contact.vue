<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 11/29/2020 -->
<template>
    <div class="contact">
        <h3 class="text-center primary--text  font-weight-light">Contact Us!</h3>
        <v-container>
            <Notifications></Notifications>
            <StatusAlerts></StatusAlerts>
            <v-layout row wrap justify-center>
                <v-flex v-if="loggedInUser !== null && loggedInUser !== undefined" xs11 md6 xl4>
                    <v-form id="contact-form" @submit.prevent="submitServer" class="text-center" ref="contactform" v-model="valid">
                        <v-text-field type="text" name="contactTopic" v-model="form.topic" :counter="100" :rules="topicRules" label="Topic" required></v-text-field>
                        <v-text-field type="text" name="contactEmail" v-model="form.email" :rules="emailRules" label="E-mail" required></v-text-field>
                        <v-text-field type="text" name="image" :rules="urlRules" label="URL to image regarding inquiry (optional)"></v-text-field>
                        <v-textarea name="contactContent" v-model="form.suggestion" label="Your suggestion or issue..." :rules="contentRules" auto-grow required></v-textarea>
                        <v-btn type="submit" text class="primary">Contact</v-btn>
                    </v-form>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken } from '@/common.js'
import { emailTopicLength, notEmpty, validEmail, optionalValidUrl } from '@/validations.js'
export default {
    data: () => ({
        form: {
            topic: '',
            email: '',
            suggestion: '',
            status: ''
        },
        csrfToken: '',
        headers: new Headers(),
        loggedInUser: null,
        accessTokenEncoded: '',
        //  userRetrieved: false,
        valid: false,
        topicRules: [
            notEmpty,
            emailTopicLength
        ],
        emailRules: [
            notEmpty,
            validEmail
        ],
        contentRules: [
            notEmpty
        ],
        urlRules: [
            optionalValidUrl
        ]
    }),
    methods: {
        submitServer() {
            if (!this.$refs.contactform.validate()) {
                //this.toggleAlert("Data is missing or in an incorrect format! Please review your entered data and try again!");
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('contact-form');
            const headers = this.headers;
            if (this.loggedInUser !== null) {
                fetch('http://localhost:8080/contact', {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: new FormData(formElement)
                    }).then(function(response) {
                        return response.text();
                    }.bind(this))
                    .then(function(decResponse) {
                       // this.toggleAlert(decResponse);
                       eventHub.$emit("notifyUser", decResponse);
                        this.$refs.contactform.reset()
                    }.bind(this))
                    .catch(e => {
                        //this.toggleAlert(e);
                        eventHub.$emit("notifyUser", e);
                        this.$refs.contactform.reset();
                    })
            }

        }
    },
    created: async function() {
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.loggedInUser = await this.$auth.getUser();
        // this.userRetrieved = true;
        // second param is related to is page loading - user is retrieved so its not loading
        // third param is related to user status - if we pass null, then everything is fine, otherwise pass 'no user' or something like that
        // fourth param is the message we sent to the component - include null if we want no message
        eventHub.$emit('changeStatusAlert', false, null, (this.loggedInUser === null || this.loggedInUser === undefined) ? 'Cannot access the contact form! Try again later!' : null);
        this.headers.append("USER-TOKEN", this.accessTokenEncoded);
        this.headers.append("X-XSRF-TOKEN", getToken());
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications
    }
}
</script>