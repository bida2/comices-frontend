 import eventHub from '@/main.js'

 export function getCookie(name) {
     if (!document.cookie) {
         return null;
     }
     const xsrfCookies = document.cookie.split(';')
         .map(c => c.trim())
         .filter(c => c.startsWith(name + '='));
     if (xsrfCookies.length === 0) {
         return null;
     }
     return decodeURIComponent(xsrfCookies[0].split('=')[1]);
 }

 export function replaceStringAt(str, startIndex, endIndex, chr) {
     if (startIndex > str.length - 1) return str;
     return str.substring(0, startIndex) + chr + str.substring(endIndex);
 }

 export function parseHTMLFromText(html) {
     var t = document.createElement('template');
     t.innerHTML = html;
     return t.content.cloneNode(true);
 }

 export function getToken() {
     // Do a fetch to GET the XSRF-TOKEN as a cookie
     fetch('http://localhost:8080/getToken');
     let csrfToken = getCookie('XSRF-TOKEN');
     return csrfToken;
 }

 export async function getEncodedAccessToken() {
     let accessTokenEncoded = await eventHub.$auth.getAccessToken();
     return accessTokenEncoded;
 }

 export function getDecodedAccessToken(encodedAccessToken) {
     let accessTokenDecoded = eventHub.$jwt.decode(encodedAccessToken);
     return accessTokenDecoded;
 }

 export function setUserToken(headersObject, encodedAccessToken) {
     headersObject.append('USER-TOKEN', encodedAccessToken);
     return headersObject;
 }

 // Fetches a resource, using the default GET method and returns the resource as a JSON object
 export function getResourceJson(urlToFetch) {
     let resource = null;
     return fetch(urlToFetch)
         .then(function(response) {
             return response.json()
         }).then(function(myJson) {
             resource = myJson
             return resource
         })
 }

 export function getResourceJsonWithHeaders(urlToFetch, headers) {
     let resource = null;
     return fetch(urlToFetch, {
             method: "GET",
             headers
         })
         .then(function(response) {
             return response.json()
         }).then(function(myJson) {
             resource = myJson
             return resource
         })
 }