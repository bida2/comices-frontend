<template>
    <div class="notifications">
        <v-row v-for="(alert, index) in alerts" :key="index" justify="center">
            <v-col class="ma-0 pa-0" cols="12" md="6" xl="4">
                <!-- for calcMargin() -> index - integer number 
                pixels - integer or float number
                measurementUnit - string -->
                <v-snackbar :timeout="timeout" :style="{'padding-bottom': calcMargin(index, 100, 'px')}" @input="alert.show = !alert.show" right :value="alert.show">
                    {{ alert.message }}
                    <v-btn text color="info" @click.native="removeOnClickAlert(index);">Close</v-btn>
                </v-snackbar>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import eventHub from '@/main.js'
export default {
    data: () => ({
        alerts: [],
        toRemoveIndexes: [],
        timeout: 5000,
        maxAlerts: 3
    }),
    mounted: function() {
        eventHub.$on('notifyUser', (message) => {
            this.alerts.forEach((alert, index) => {
                if (!alert.show)
                    this.toRemoveIndexes.push(alert.id);
            });
            if (this.toRemoveIndexes.length > 0) {
               this.toRemoveIndexes.forEach((alert, index) => {
                    const alertIndex = this.alerts.findIndex((alert) => alert.id === this.toRemoveIndexes[index]);
                    if (alertIndex !== -1)
                        this.alerts.splice(alertIndex, 1);
               });
               this.toRemoveIndexes = [];
            }
            if (this.alerts.length + 1 <= this.maxAlerts) {
                this.alerts.push({ 'id': this.generateQuickGuid(), 'message': message, 'endTime': Date.now() + this.timeout, 'show': true });
            }
        })
    },
    watch: {
       /* alerts: {
            deep: true,
            handler() {
                this.clearFromQueue();
            }
        } */
    },
    methods: {
        calcMargin(index, pixels, measurementUnit) {
            return (index * pixels) + measurementUnit
        },
        removeOnClickAlert(index) {
            this.alerts.splice(index, 1);
        },
        generateQuickGuid() {
            return Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
        }
    }
}
</script>