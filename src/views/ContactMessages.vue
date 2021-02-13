<template>
    <div class="userSuggested">
        <StatusAlerts></StatusAlerts>
        <v-container fluid class="text-center my-5" v-if="resourceLoaded == true && (contactMessages != null && contactMessages != undefined)">
            <h3 class="text-center primary--text font-weight-light">User Contact Messages</h3>
           <Notifications></Notifications>
            <v-layout row wrap class="justify-flex-space-evenly">
                <v-flex xs5 lg3 xl2 class="comics-margin" v-for="contactMessage in contactMessages" :key="contactMessage.contactId">
                    <v-row>
                        <v-col>
                            <v-flex class="text-center" xs12>
                                <v-card max-width="344">
                                    <v-row>
                                        <v-col>
                                            <v-flex class="text-center" xs12>
                                                <span class="font-weight-bold mb-2">Message Topic:</span>
                                                <p class="blue--text text--darken-4 title-link ma-0"> {{ contactMessage.contactTopic }} </p>
                                            </v-flex>
                                        </v-col>
                                    </v-row>
                                    <v-divider></v-divider>
                                    <v-row>
                                        <v-col>
                                            <v-flex class="text-center" xs12>
                                                <span class="mb-2">Contact Email:</span>
                                                <p class="ma-0"> {{ contactMessage.contactEmail }} </p>
                                            </v-flex>
                                        </v-col>
                                    </v-row>
                                    <v-divider></v-divider>
                                    <v-row class="pl-4">
                                        <v-col class="text-center">
                                            <v-container class="pa-0">
                                                <v-row>
                                                    <v-col v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                                                        <v-btn @click="removeContactMessage(contactMessage.contactId, headers)" icon>
                                                            <v-icon>mdi-close-circle</v-icon>
                                                        </v-btn>
                                                    </v-col>
                                                    <v-col v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                                                        <v-btn :to="'/replyContact?cId=' + contactMessage.contactId" icon>
                                                            <v-icon>mdi-pencil</v-icon>
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-flex>
                        </v-col>
                    </v-row>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
import eventHub from "@/main.js"
import Notifications from '@/components/Notifications.vue'
import StatusAlerts from '@/components/StatusAlerts.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken, getResourceJsonWithHeaders } from '@/common.js'
export default {
    data: () => ({
        contactMessages: null,
        accessTokenEncoded: '',
        headers: new Headers(),
        resourceLoaded: false,
        loggedInUser: '',
        csrfToken: '',
        accessTokenDecoded: null,
    }),
    created: async function() {
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
            this.loggedInUser = null;
        }.bind(this))
        eventHub.$on("resourceLoaded", (resourceLoaded) => {
            this.resourceLoaded = resourceLoaded;
        });
    },
    watch: {
        contactMessages: function() {
            if (!this.contactMessages) {
                eventHub.$emit('changeStatusAlert', false, null, "Something went wrong with retrieving the contact messages!");
            }
            else if (this.contactMessages.length > 0) {
                eventHub.$emit('changeStatusAlert', false, null, null);
            } else if (this.contactMessages.length === 0) {
                eventHub.$emit('changeStatusAlert', false, null, "No contact messages! Get some users to write them!");
            }
        }
    },
    mounted: async function() {
        this.loggedInUser = await this.$auth.getUser();
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
        this.contactMessages = await getResourceJsonWithHeaders('http://localhost:8080/allContacts', this.headers);
    },
    methods: {
        removeContactMessage(contactMessageId, headers) {
            if (this.accessTokenDecoded !== null && this.accessTokenDecoded.groups.includes('admins')) {
                fetch('http://localhost:8080/deleteContact?cId=' + contactMessageId, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include',
                    })
                    .then(function(response) {
                        return response.text()
                    })
                    .then(async function(message) {
                        eventHub.$emit("notifyUser", message);
                        this.contactMessages = await getResourceJsonWithHeaders('http://localhost:8080/allContacts', this.headers);
                    }.bind(this))
            } else {
              eventHub.$emit("notifyUser", "You are not currently logged-in!");
            }
        },
    },
    components: {
        'StatusAlerts': StatusAlerts,
        'Notifications': Notifications
    }
}
</script>