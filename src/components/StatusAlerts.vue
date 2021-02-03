<template>
    <div class="statusAlerts">
        <v-row v-if="loading === true" justify="center">
            <v-col class="ma-0 pa-0" cols="12" md="6" xl="4">
                <v-alert type="info">
                    Granting access...
                </v-alert>
            </v-col>
        </v-row>
        <v-row v-if="userStatus" justify="center">
            <v-col class="ma-0 pa-0" cols="12" md="6" xl="4">
                <v-alert type="error">
                    You are not logged in!
                </v-alert>
            </v-col>
        </v-row>
        <v-row v-if="noResourceMessage && noResourceMessage !== ''" justify="center">
            <v-col class="ma-0 pa-0" cols="12" md="6" xl="4">
                <v-alert type="error">
                    {{ noResourceMessage }}
                </v-alert>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import eventHub from '@/main.js'
export default {
    data: () => ({
        noResourceMessage: null,
        userStatus: null,
        loading: true,
    }),
    mounted: function() {
        eventHub.$on('changeStatusAlert', (isPageLoading, isUserLoggedIn, message) => {
            this.loading = isPageLoading;
            this.noResourceMessage = message;
            this.userStatus = isUserLoggedIn;
        })
    },
}
</script>