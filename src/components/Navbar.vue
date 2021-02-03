<template>
    <div app>
        
        <v-app-bar flat color="primary accent-4" dark>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title class="d-none d-xl-block">Comic<span class="yellow--text text--lighten-1">ES</span></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-autocomplete ref="searchBar" id="search-bar" class="custom-flex-shrink d-xl-flex d-none mt-xl-4" v-model="searchValue" :loading="debounceLoading" :items="searchItems" @keyup.enter="searchComic" :search-input.sync="search" item-text="comicName" dense return-object></v-autocomplete>
            <v-btn class="d-xl-block d-none mr-xl-5" icon @click="searchComic">
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <!-- We need to be taken to the login page when we click on this - use props 'router' and ':to="<data-binded-variable-here>"' -->
            <v-skeleton-loader v-show="skeletonLoading" :loading="skeletonLoading" transition="fade-transition" type="button">
            </v-skeleton-loader>
            <v-menu v-if="isAuthed == true && showButtons == true" offset-y>
                <template v-slot:activator="{ on }">
                    <v-btn depressed color="primary" dark v-on="on">
                        Profile <v-icon right>mdi-chevron-down</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item v-for="(link, index) in profileLinks" :key="index" :to="profileLinks[index].url">
                        <v-list-item-title>{{ link.title }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" to="/contactMessages">
                        <v-list-item-title>Messages</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" to="/reviewRequests">
                        <v-list-item-title>All Review Requests</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')" to="/allComicSuggestions">
                        <v-list-item-title>All Suggested Comics</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-skeleton-loader class="ml-xl-1" v-show="skeletonLoading == true && isAuthed == true" :loading="skeletonLoading" transition="fade-transition" type="button">
            </v-skeleton-loader>
            <v-btn v-if="isAuthed == true && showButtons == true" active-class="override-active-link" color="white" @click="handleLogout" text router to="#">Logout</v-btn>
            <v-btn v-if="isAuthed == false && showButtons == true" color="white" @click="handleLogin" text router to="#">Login</v-btn>
        </v-app-bar>
        <v-navigation-drawer v-model="drawer" absolute temporary>
            <v-list-item>
                <v-list-item-avatar>
                    <v-img src="@/assets/thought-bubble.svg"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title>Comic<span class="yellow--text text--darken-3">ES</span></v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <h5 class="text-center mt-xl-2 primary white--text font-weight-light pa-xl-2">Comic Links</h5>
            <v-list dense>
                <v-list-item v-for="item in comicLinks" :key="item.title" link router :to="item.url">
                    <v-list-item-icon>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </v-list>
            <h5 class="text-center primary white--text font-weight-light pa-xl-2">Extra Links</h5>
            <v-list dense>
                <v-list-item v-for="item in extraLinks" :key="item.title" link router :to="item.url">
                    <v-list-item-icon>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </v-list>
            <div v-if="accessTokenDecoded !== null && accessTokenDecoded.groups.includes('admins')">
                <h5 class="text-center primary white--text font-weight-light pa-xl-2">Admin Links</h5>
                <v-list dense>
                    <v-list-item v-for="item in adminLinks" :key="item.title" link router :to="item.url">
                        <v-list-item-icon>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </div>
        </v-navigation-drawer>
    </div>
</template>
<script>
import eventHub from '@/main.js'
import { getToken, getEncodedAccessToken, getDecodedAccessToken } from '@/common.js'
export default {
    data: () => ({
        searchValue: null,
        searchItems: [],
        debounceLoading: false,
        skeletonLoading: true,
        showButtons: false,
        search: null,
        timer: null,
        profileLinks: [
            { title: 'Favourites', url: '/favourites' },
            { title: 'My Suggested Comics', url: '/userSuggested' }
        ],
        comicLinks: [
            { title: 'Comics', url: '/' },
            { title: 'Search Tags', url: '/searchTags' },
            { title: 'Get A Random Comic', url: '/randComic' },
            { title: 'Comic Reviews', url: '/reviews' },
            { title: 'Comic Book News', url: '/news' },
            { title: 'Suggest A Comic', url: '/suggestComic' },
            { title: 'Request Comic Review', url: '/requestReview' }
        ],
        extraLinks: [
            { title: 'Video Materials', url: '/videos' },
            { title: 'Forums', url: '/forums' },
            { title: 'Contact Us', url: '/contacts' },

        ],
        adminLinks: [
            { title: 'Upload Files', url: '/upload' },
            { title: 'Download Files', url: '/downloadFiles' },
            { title: 'Add a Comic', url: '/addComic' },
            { title: 'Add a Comic Review', url: '/addComicReview' }
        ],
        drawer: false,
        csrfToken: '',
        headers: new Headers(),
        accessTokenEncoded: '',
        accessTokenDecoded: null,
        activeUser: null,
        isAuthed: false,
    }),
    watch: {
        '$route'() {
            this.refreshActiveUser()
            this.refreshTokens()
        },
        search(val) {
            // initial if value : this.$refs.searchBar.isFocused -tested and prevents null
            if (val)
                this.fetchEntriesDebounced(val)
        }
    },
    created: async function() {
        this.isAuthed = await this.$auth.isAuthenticated();
        const readyHandler = function() {
            if (document.readyState == 'complete') {
                setTimeout(function() {
                    this.skeletonLoading = false;
                    this.showButtons = true;
                    document.removeEventListener('readystatechange', readyHandler);
                }.bind(this), 1000);
            }
        }.bind(this);
        document.addEventListener('readystatechange', readyHandler);
        readyHandler(); // in case the component has been instantiated lately after loading
        eventHub.$on('loggedOut', function() {
            this.accessTokenEncoded = undefined;
            this.accessTokenDecoded = null;
            this.activeUser = null;
            this.isAuthed = false;
        }.bind(this))
    },
    mounted: async function() {
        this.activeUser = await this.$auth.getUser();
        this.headers.append('X-XSRF-TOKEN', getToken());
        this.accessTokenEncoded = await getEncodedAccessToken();
        this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
        this.headers.append('USER-TOKEN', this.accessTokenEncoded);
    },
    methods: {
        fetchEntriesDebounced(val) {
            // cancel pending call
            clearTimeout(this.timer)

            // delay new call 700ms
            this.timer = setTimeout(function() {
                this.debounceLoading = true;
                fetch('http://localhost:8080/searchComic?f=' + val)
                    .then(res => res.clone().json())
                    .then(function(res) {
                        this.searchItems = res
                    }.bind(this))
                    .catch(err => {
                        throw err;
                    })
                    .finally(() => (this.debounceLoading = false))
            }.bind(this), 700)
        },
        async refreshActiveUser() {
            this.activeUser = await this.$auth.getUser()
            this.isAuthed = await this.$auth.isAuthenticated()
        },
        async refreshTokens() {
            this.headers.set('X-XSRF-TOKEN', getToken());
            this.accessTokenEncoded = await getEncodedAccessToken();
            this.accessTokenDecoded = getDecodedAccessToken(this.accessTokenEncoded);
            this.headers.set('USER-TOKEN', this.accessTokenEncoded);
        },
        handleLogin() {
            this.$auth.loginRedirect(this.$route.fullPath);
        },
        handleLogout() {
            this.$auth.logout()
            eventHub.$emit("loggedOut")
            this.refreshActiveUser()
            this.$router.push('/')
        },
        searchComic() {
            let searchBar = document.getElementById('search-bar');
            if (searchBar.value == "") return;
            this.$router.push('/search?f=' + searchBar.value);
        }

    }
}
</script>