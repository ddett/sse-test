// import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

console.log('port', process.env.PORT);
const server = {
	port: process.env.PORT || 3000,
	host: process.env.HOST || '0.0.0.0',
};
// console.log('process.env.ENV ', process.env.ENV);
if (process.env.ENV === 'dev' && process.env.CERT_DIR && process.env.CERT_FILENAME) {
	// for windows, do this:
	// https://ricktowns.com/post/2020/04/02/windows-10-self-signed-certificate
	// and then:
	// https://helpcenter.gsx.com/hc/en-us/articles/115015887447-Extracting-Certificate-crt-and-PrivateKey-key-from-a-Certificate-pfx-File
	server.https = {
		key: fs.readFileSync(
			path.resolve(process.env.CERT_DIR, `${process.env.CERT_FILENAME}.key`)
		),
		cert: fs.readFileSync(
			path.resolve(process.env.CERT_DIR, `${process.env.CERT_FILENAME}.crt`)
		),
	};
}

export default {
	// Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
	ssr: false,

	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: 'sse-test',
		htmlAttrs: {
			lang: 'en',
		},
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'description', name: 'description', content: '' },
			{ name: 'format-detection', content: 'telephone=no' },
		],
		link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [],

	server,

	serverMiddleware: ['~/api/app.js'],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: ['@deepsource/nuxt-websocket'],

	websocket: {
		// url: 'wss://echo.websocket.events/',
		reconnectInterval: 1000,
	},

	publicRuntimeConfig: {
		websocket: {
			url: process.env.WEBSOCKET_URL,
		},
	},

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {},

	render: {
		gzip: false,
	},

	// taken from https://github.com/nuxt/rfcs/issues/36 ... but this is all so confusing
	// hooks: {
	// 	ready(nuxt) {
	// 		setInterval(async () => {
	// 			const tweets = await fetch(
	// 				`https://api.example.com/tweets?from=${Date.now() - 2000}`
	// 			).then(res => res.json());
	// 			tweets.forEach(tweet => nuxt.$sse.broadcast('tweet', tweet));
	// 		}, 2000);
	// 	},
	// },
};
