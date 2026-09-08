const http = require("http");

const TARGET_PORT = 3000;
const LISTEN_PORT = 3001;

const server = http.createServer((req, res) => {
  const options = {
    hostname: "127.0.0.1",
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${TARGET_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
    }
    res.end("Forwarding error: " + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`Port forwarder listening on http://localhost:${LISTEN_PORT} -> http://localhost:${TARGET_PORT}`);
});
