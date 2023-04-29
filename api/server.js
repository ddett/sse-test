// create an express server
const express = require("express");
const server = express();

module.exports = {
  path: "/api",
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

server.get("/sse", (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with client

  let counter = 0;
  let interValID = setInterval(() => {
    counter++;
    console.log("counter ", counter);
    if (counter >= 10) {
      res.write("data: [DONE]\n\n"); // this is also what OpenAI uses to signal end of stream https://platform.openai.com/docs/api-reference/completions/create#completions/create-stream
      clearInterval(interValID);
      // res.end(); // terminates SSE session
      return;
    }
    // res.write() instead of res.send()
    res.write(
      `data: ${JSON.stringify({ text: "hi there", num: counter })}\n\n`
    );
  }, 1000);

  // If client closes connection, stop sending events
  res.on("close", () => {
    console.log("client dropped me");
    clearInterval(interValID);
    res.end();
  });
});
