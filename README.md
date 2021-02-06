# ComicES

## What is ComicES?
ComicES is a personal blog and a comic book sharing platform - users can share their favourite comics, comment on their favourite comics, suggest new comics, rate comics and more!

## How do I run this project?
This is the frontend part of the project, **built on Vue.js with the Vuetify component framework**. In order to install it and run it, you will need to have Node.js and NPM installed properly.
After that, you can start a Command Prompt inside the project folder and run the command below to set up dependencies of the project
```
npm install
```
After the dependencies have been set up, run the command below to start the app on **localhost:9000**
```
npm run serve
```

This project uses Okta for authorization - in order to use it properly, you need to provide a `okta.js` file in the `src` folder.
This file must contain the following:
```
var oktaDetails = {
	issuer: <your okta issuer URL>,
	client_id: <your okta client id>,
	redirect_uri: window.location.origin + '/implicit/callback',
	scopes: <your desired okta scopes>
}
export default oktaDetails;
```
