import Auth from '@okta/okta-vue'
import Vue from 'vue'
import VueJWT from 'vuejs-jwt'
import Router from 'vue-router'
import Comics from '@/views/Comics.vue'
import Contact from '@/views/Contact.vue'
import ComicSummary from '@/views/ComicSummary.vue'
import ComicReviews from '@/views/ComicReviews.vue'
import ComicReview from '@/views/ComicReview.vue'
import Forum from '@/views/Forum.vue'
import Post from '@/views/Post.vue'
import Thread from '@/views/Thread.vue'
import AddComic from '@/views/AddComic.vue'
import EditComic from '@/views/EditComic.vue'
import Favourites from '@/views/Favourites.vue'
import SuggestComic from '@/views/SuggestComic.vue'
import UserSuggested from '@/views/UserSuggested.vue'
import EditSuggestion from '@/views/EditSuggestion.vue'
import EditPost from '@/views/EditPost.vue'
import RequestReview from '@/views/RequestReview.vue'
import ContactMessages from '@/views/ContactMessages.vue'
import RespondContactMessage from '@/views/RespondContactMessage.vue'
import AllReviewRequests from '@/views/AllReviewRequests.vue'
import AddComicReview from '@/views/AddComicReview.vue'
import EditReview from '@/views/EditReview.vue'
import EditThread from '@/views/EditThread.vue'
import Announcement from '@/views/Announcement.vue'
import EditAnnouncement from '@/views/EditAnnouncement.vue'
import ComicBookNews from '@/views/ComicBookNews.vue'
import SearchResults from '@/views/SearchResults.vue'
import ComicBookNewsArticle from '@/views/ComicBookNewsArticle.vue'
import VideoMaterials from '@/views/VideoMaterials.vue'
import EditNewsArticle from '@/views/EditNewsArticle.vue'
import UploadAssets from '@/views/UploadAssets.vue'
import EditVideoMaterials from '@/views/EditVideoMaterials.vue'
import DownloadFiles from '@/views/DownloadFiles.vue'
import RandomComicSuggestion from '@/views/RandomComicSuggestion.vue'
import SearchTags from '@/views/SearchTags.vue'
import AddVideoMaterial from '@/views/AddVideoMaterial.vue'
import AllComicSuggestions from '@/views/AllComicSuggestions.vue'
import Test from '@/views/Test.vue'
import oktaDetails from '@/okta.js'

Vue.use(Auth, {
    issuer: oktaDetails.issuer,
    client_id: oktaDetails.client_id,
    redirect_uri: oktaDetails.redirect_uri,
    onSessionExpired: function() {},
    scopes: oktaDetails.scopes
});


Vue.use(Router)
Vue.use(VueJWT, null)

let router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [{
            path: '/',
            name: 'home',
            component: Comics
        },
        {
            path: '/news',
            name: 'news',
            component: ComicBookNews
        },
        {
            path: '/contacts',
            name: 'contactPage',
            component: Contact
        },
        {
            path: '/summary',
            name: 'comicSummaryPage',
            component: ComicSummary
        },
        {
            path: '/reviews',
            name: 'comicReviewPage',
            component: ComicReviews,
            meta: {
                requiresAuth: true
            }
        },
         {
            path: '/allComicSuggestions',
            name: 'allComicSuggestions',
            component: AllComicSuggestions,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/review',
            name: 'comicReviewPageSummary',
            component: ComicReview
        },
        {
            path: '/forums',
            name: 'Forums',
            component: Forum
        },
        {
            path: '/thread',
            name: 'threadForum',
            component: Post
        },
        {
            path: '/addComic',
            name: 'addANewComic',
            component: AddComic,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/createThread',
            name: 'newThread',
            component: Thread,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/editComic',
            name: 'editComic',
            component: EditComic,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/favourites',
            name: 'favourites',
            component: Favourites,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/suggestComic',
            name: 'comicSuggestion',
            component: SuggestComic,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/userSuggested',
            name: 'userSuggestedComics',
            component: UserSuggested,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/editComicSuggestion',
            name: 'editSuggestion',
            component: EditSuggestion,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/editPost',
            name: 'editPost',
            component: EditPost,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/requestReview',
            name: 'requestComicReview',
            component: RequestReview,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/contactMessages',
            name: 'userContactMessages',
            component: ContactMessages,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/replyContact',
            name: 'respondToUserMessages',
            component: RespondContactMessage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/reviewRequests',
            name: 'allReviewRequests',
            component: AllReviewRequests,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/addComicReview',
            name: 'addReview',
            component: AddComicReview,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/editReview',
            name: 'editReview',
            component: EditReview,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/editThread',
            name: 'editThread',
            component: EditThread,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/announcement',
            name: 'announcement',
            component: Announcement
        },
        {
            path: '/editAnnouncement',
            name: 'editAnnouncement',
            component: EditAnnouncement,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/search',
            name: 'searchResults',
            component: SearchResults,
        },
        {
            path: '/newsArticle',
            name: 'newsArticle',
            component: ComicBookNewsArticle,
        },
        {
            path: '/videos',
            name: 'videoMaterials',
            component: VideoMaterials,
        },
        {
            path: '/editNewsArticle',
            name: 'editNewsArticle',
            component: EditNewsArticle,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/upload',
            name: 'uploadAssets',
            component: UploadAssets,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/editVideoMaterial',
            name: 'editVideo',
            component: EditVideoMaterials,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/downloadFiles',
            name: 'downloadFiles',
            component: DownloadFiles,
            meta: {
                requiresAuth: true
            }
        },
         {
            path: '/searchTags',
            name: 'searchTags',
            component: SearchTags,
        },
        {
            path: '/randComic',
            name: 'randComicSuggestion',
            component: RandomComicSuggestion,
        },
        {
            path: '/addVideoMaterial',
            name: 'addVideoMaterial',
            component: AddVideoMaterial,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/test',
            name: 'test',
            component: Test,
        },
        {
            path: '/implicit/callback',
            component: Auth.handleCallback(),
        },
    ]
});

router.beforeEach(Vue.prototype.$auth.authRedirectGuard());

export default router;