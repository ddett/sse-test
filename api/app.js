// create an express server
const express = require('express');
const server = express();
const { status, header } = require('node-res');

module.exports = {
	path: '/api',
	handler: server,
};

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
