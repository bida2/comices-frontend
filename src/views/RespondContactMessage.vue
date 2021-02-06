<template>
    <div class="responseContact">
        <StatusAlerts></StatusAlerts>
        <v-container v-if="cMessage != '' && cMessage != undefined">
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <p>You are responding to a message from <b>{{ cMessage.contactEmail }}</b></p>
                    <p class="ma-xl-0 pa-xl-0"><b>About:</b> {{ cMessage.contactTopic }}</p>
                    <p class="ma-xl-0 pa-xl-0"><b>Message:</b> {{ cMessage.contactContent }}</p>
                    <p v-if="cMessage.imageURL" class="mt-xl-0 pt-xl-0"><b>Image URL:</b> <a class="no-deco-wo-hover ml-xl-2" :href="cMessage.imageURL">Click Here!</a>
                        <v-btn class="mb-xl-1 ml-xl-2" @click="origUrlVisible = !origUrlVisible" v-if="cMessage.origURL" icon color="primary">
                            <v-icon size="24px" class="mt-xl-0 pt-xl-0">mdi-help-circle</v-icon>
                        </v-btn>
                    </p>
                    <v-fade-transition>
                        <p v-show="origUrlVisible">Original URL is: <a :href="cMessage.origURL">{{ cMessage.origURL }}</a></p>
                    </v-fade-transition>
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <Notifications></Notifications>
            <v-row v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-2 font-weight-light">Respond To A Contact Message</h3>
                    <v-form id="contact-response-form" @submit.prevent="sendContanctMessageResponse(headers)" class="text-center" v-model="valid" ref="contactmessageresponseform">
                        <v-text-field name="email" label="Inquiry E-mail" :value="cMessage.contactEmail" required readonly></v-text-field>
                        <v-text-field name="senderEmail" :rules="emailRules" label="Your E-mail Adress" required></v-text-field>
                        <v-textarea name="emailContent" :rules="emailContentRules" label="Your response to the user's message" auto-grow required></v-textarea>
                        <v-btn type="submit" text class="primary">Respond</v-btn>
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
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJsonWithHeaders } from '@/common.js'
import { emailRules, notEmpty, validEmail } from '@/validations.js'
export default {
    data: () => ({
        cMessage: '',
        valid: false,
        headers: new Headers(),
        csrfToken: '',
        origUrlVisible: false,
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        emailRules: [
            notEmpty,
            validEmail
        ],
        emailContentRules: [
            notEmpty
        ]
    }),
    watch: {
        cMessage() {
            if (this.cMessage && this.cMessage != undefined) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the contact message!");
            }
        }
    },
    methods: {
        sendContanctMessageResponse(headers) {
            if (!this.$refs.contactmessageresponseform.validate()) {
                eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            eventHub.$emit("notifyUser", "Sending response...");
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                const formElement = document.getElementById('contact-response-form');
                fetch('http://localhost:8080/respondContactMessage', {
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
                    }.bind(this))
            } else {
                eventHub.$emit("notifyUser", "Access denied! Cannot send an email response!");
            }

        },
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
        this.cMessage = await getResourceJsonWithHeaders('http://localhost:8080/getContact?cId=' + this.$route.query.cId, this.headers);
    },
    components: {
        'Notifications': Notifications,
        'StatusAlerts': StatusAlerts
    }
}
</script>