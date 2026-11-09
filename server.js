const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 8000;

http
  .createServer((request, response) => {
    const pathname = request.url === "/" ? "/index.html" : request.url;
    const filePath = path.join(__dirname, pathname);

    if (pathname !== "/index.html" || !fs.existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(fs.readFileSync(filePath));
  })
  .listen(port, () => console.log(`Local server running at http://localhost:${port}`));
