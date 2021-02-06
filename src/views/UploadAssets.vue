<!-- Alerts implementation exchanged for new v-snackbar implementation with multiple v-snackbars at a time - 11/28/2020 -->
<template>
    <div class="assetUploader">
        <v-container>
             <Notifications></Notifications>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Upload Assets To Server</h3>
                    <v-form enctype="multipart/form-data" id="files-form" @submit.prevent="submitFiles(headers)" class="text-center" v-model="valid" ref="filesuploadform">
                        <v-file-input small-chips multiple name="files" @click.native="validateField($refs.filesuploadform)"  :rules="fileUploadRules" accept=".doc,.docx,image/*" label="Select one or more assets here...(30 MB limit)"></v-file-input>
                        <v-btn type="submit" text class="primary">Upload Files</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Upload Assets to ImgBB</h3>
                    <v-form enctype="multipart/form-data" id="files-form-imgbb" @submit.prevent="submitFilesImgBb(headers)" class="text-center" v-model="valid" ref="imgbbform">
                        <v-file-input small-chips name="file" @click.native="validateField($refs.imgbbform)" :rules="fileUploadRules" accept=".tiff, .bmp, .png, .jpeg, .jpg, .gif" label="Select a file to upload (30 MB limit)"></v-file-input>
                        <v-btn type="submit" text class="primary">Upload Files To ImgBB</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Upload Assets to File.io</h3>
                    <v-form enctype="multipart/form-data" id="files-form-fileio" @submit.prevent="submitFilesFileIo(headers)" ref="fileioform" class="text-center" v-model="valid">
                        <v-file-input small-chips name="file" @click.native="validateField($refs.fileioform)" :rules="fileUploadRules" accept="*/*" label="Select a file to upload (30 MB limit)"></v-file-input>
                        <v-btn type="submit" text class="primary">Upload Files To File.io</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h3 class="text-center primary--text mt-xl-5 font-weight-light">Upload Assets to Streamable</h3>
                    <v-form enctype="multipart/form-data" id="files-form-streamable" @submit.prevent="submitFilesStreamable(headers)" class="text-center" v-model="valid" ref="streamableform">
                        <v-file-input small-chips @click.native="validateField($refs.streamableform)" :rules="fileUploadRules" name="file" accept="video/*" label="Select a file to upload (30 MB limit)"></v-file-input>
                        <v-btn type="submit" text class="primary">Upload Files To Streamable</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <v-row v-if="accessTokenEncoded !== null && accessTokenDecoded.groups.includes('admins')" justify="center">
                <v-col cols="12" md="6" xl="4">
                    <h4 class="mt-xl-4" v-show="upLinkImgbb">Your Imgbb file has been uploaded at: </h4><span><a :href="upLinkImgbb">{{ upLinkImgbb }}</a></span>
                    <h4 class="mt-xl-4" v-show="upLinkFileIo">Your File.io file has been uploaded at: </h4><span><a :href="upLinkFileIo">{{ upLinkFileIo }}</a></span>
                    <h4 class="mt-xl-4" v-show="upLinkStreamable">Your Streamable file has been uploaded at: </h4><span><a :href="upLinkStreamable">{{ upLinkStreamable }}</a></span>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import Notifications from '@/components/Notifications.vue'
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
import { fileListNotEmpty } from '@/validations.js'
export default {
    data: () => ({
        valid: false,
        upLinkImgbb: '',
        upLinkFileIo: '',
        upLinkStreamable: '',
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        fileUploadRules: [
            fileListNotEmpty
        ],
        message: ''
    }),
    methods: {
        submitFiles(headers) {
            if (!this.$refs.filesuploadform.validate()) {
               eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('files-form');
           eventHub.$emit("notifyUser", "File(s) currently uploading...");
            fetch('http://localhost:8080/uploadFiles', {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    return response.text();
                }).then(function(response) {
                  eventHub.$emit("notifyUser", response);
                }.bind(this))
        },
        submitFilesImgBb(headers) {
            if (!this.$refs.imgbbform.validate()) {
                 eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('files-form-imgbb');
            eventHub.$emit("notifyUser", "File(s) currently uploading...");
            fetch('http://localhost:8080/uploadToImgBb', {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    if (response.status >= 400)
                        return response.text()
                    return response.json()
                }).then(function(jsonResponse) {
                    if (typeof jsonResponse === "object" && jsonResponse.success === true) {
                        this.upLinkImgbb = jsonResponse.data.display_url;
                        this.message = "File successfully uploaded!";
                    } else if (typeof jsonResponse === "object" && jsonResponse.success === false) {
                        this.message = "Could not upload image to ImgBB servers! Try again later!";
                    } else
                        this.message = jsonResponse;
                    eventHub.$emit("notifyUser", this.message);
                }.bind(this))
        },
        submitFilesFileIo(headers) {
            if (!this.$refs.fileioform.validate()) {
               eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('files-form-fileio');
            eventHub.$emit("notifyUser", "File(s) currently uploading...");
            fetch('http://localhost:8080/uploadFileio', {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    if (response.status >= 400)
                        return response.text();
                    return response.json();
                }).then(function(finalResponse) {
                    if (typeof finalResponse === "object" && finalResponse.success === true) {
                        this.message = "File has been uploaded successfully!";
                        this.upLinkFileIo = finalResponse.link;
                    } else if (typeof finalResponse === "object" && finalResponse.success === false) {
                        this.message = "Could not upload image to FileIo servers! Try again later!";
                    } else
                        this.message = finalResponse;
                   eventHub.$emit("notifyUser", this.message);
                }.bind(this))
        },
        submitFilesStreamable(headers) {
             if (!this.$refs.streamableform.validate()) {
               eventHub.$emit("notifyUser", "Data is missing or in an incorrect format! Please review your entered data and try again!");
                return;
            }
            const formElement = document.getElementById('files-form-streamable');
             eventHub.$emit("notifyUser", "File(s) currently uploading...");
            fetch('http://localhost:8080/uploadStreamable', {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                    body: new FormData(formElement)
                })
                .then(function(response) {
                    if (response.status >= 400)
                        return response.text();
                    return response.json();
                }).then(function(jsonResponse) {
                    if (typeof jsonResponse === "object" && jsonResponse.status == 1) {
                        this.message = "File successfully uploaded!";
                        this.upLinkStreamable = "https://streamable.com/e/" + jsonResponse.shortcode;
                    } else if (typeof jsonResponse === "object" && jsonResponse.status !== 1) {
                        this.message = "Could not upload video to Streamable servers! Try again later!";
                    } else this.message = jsonResponse;
                     eventHub.$emit("notifyUser", this.message);
                }.bind(this))
        },
        // This function is used to reset validation on tab blur event - done in order to not apply validation immediately
        // when the file dialog window pops up - the validation should be applied only when a blur event happens for the 
        // file input itself
        validateField(form) {
            window.onblur = function() {
                form.resetValidation();
            };
        }
    },
    components: {
        'Notifications': Notifications
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
    },
}
</script>