// create an express server
const express = require('express');
const server = express();
const { status, header } = require('node-res');

module.exports = {
	path: '/api',
	handler: server,
};

const WebSocket = require('ws');

// TODO ws fails in deployment. wss fails everywhere.

// TODO not scalable!
// "sockets" would need to be persisted somehow
// also, we are assuming that it will be OK to start multiple websocket servers on 8080, as they will each be in their own container
// behind a magic Heroku load balancer...
const sockets = {};

// if (process.env.ENV == 'dev') {
// 	const testWs = new WebSocket('ws://localhost');
// 	testWs.addEventListener('error', e => {
// 		console.log('failed to connect to WebSocket server. starting up...');
// 		startWebSocketServer();
// 	});
// } else {
startWebSocketServer();
// }

function startWebSocketServer() {
	// const wsServer = new WebSocket('wss://localhost');
	const wsServer = new WebSocket.Server({
		port: 8080,
	});
	console.log('wsServer', wsServer);
	wsServer.on('connection', (socket, req) => {
		console.log('ws connection');
		console.log('ws req.headers.origin', req.headers.origin);
		console.log('ws req.url', req.url);
		socket.send('hoohohoh');
		if (req.headers.origin) {
			const urlObj = new URL(req.headers.origin + req.url);
			const userId = urlObj.searchParams.get('userId');
			// console.log('adding to sockets', userId);
			sockets[userId] = socket;

			// // When message received, send that message to every socket.
			// socket.on('message', msg => {
			// 	console.log('ws message received', msg);
			// 	sockets.forEach(s => s.send(msg));
			// });

			// When a socket closes or disconnects, remove it from the array.
			socket.on('close', () => {
				console.log('ws close ');
				for (const userId in sockets) {
					if (sockets[userId] == socket) {
						// console.log('ws closed socket for user ', userId);
						delete sockets[userId];
					}
				}
			});
		} else {
			console.warn('WS server connection: no req.origin');
		}
	});
}

// for testing websockets
setInterval(() => {
	sendWebsocketMessage({
		message: 'websocket message',
		data: {
			n: Math.floor(Math.random() * 1e6),
		},
	});
}, 2000);

// // create a route to handle SSE
// server.get('/sse', (req, res) => {
//     // set headers for SSE
//     res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         Connection: 'keep-alive',
//     });

//     // send SSE every second
//     const interval = setInterval(() => {
//         res.write(`data: ${new Date().toISOString()}\n\n`);
//     }, 1000);

//     // stop sending SSE on timeout
//     req.on('timeout', () => {
//         clearInterval(interval);
//         res.end();
//     });
// });

server.get('/sse', (req, res) => {
	console.log('enter sse');
	console.log('res', res);

	req.socket.setTimeout(0);

	status(res, 200);
	header(res, 'Content-Type', 'text/event-stream');
	header(res, 'Cache-Control', 'no-cache');

	if (req.httpVersion !== '2.0') {
		header(res, 'Connection', 'keep-alive');
	}

	// res.setHeader('Cache-Control', 'no-cache');
	// res.setHeader('Content-Type', 'text/event-stream');
	// res.setHeader('Access-Control-Allow-Origin', '*');
	// res.setHeader('Connection', 'keep-alive');
	// res.flushHeaders(); // flush the headers to establish SSE with client

	let counter = 0;
	const intervalId = setInterval(() => {
		counter++;
		console.log('will res.write. counter', counter);
		res.write(`data: ${JSON.stringify({ text: 'hi there', num: counter })}\n\n`);
		if (counter >= 10) {
			// this is also what OpenAI uses to signal end of stream https://platform.openai.com/docs/api-reference/completions/create#completions/create-stream
			res.write('data: [DONE]\n\n');
			clearInterval(intervalId);
			// res.end(); // terminates SSE session
			return;
		}
	}, 800);

	// If client closes connection, stop sending events
	res.on('close', () => {
		console.log('client dropped me');
		clearInterval(intervalId);
		res.end();
	});
});

/**
 *
 * @param {*} message object to send, will be JSON.stringified
 * @param {*} userId user to whom the message is directed, or null to send to all users
 */
function sendWebsocketMessage(message, userId) {
	message = JSON.stringify(message);
	if (userId) {
		const socket = sockets[userId.toString()];
		socket?.send(message);
		if (socket) {
			console.log(`sendWebsocketMessage sent message to ${userId}`, message);
		}
	} else {
		for (const userId in sockets) {
			sockets[userId].send(message);
			console.log(`sendWebsocketMessage sent message to ${userId}`, message);
		}
	}
}
