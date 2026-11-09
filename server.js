const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 8000;

http
  .createServer((request, response) => {
    const pathname = request.url === "/" ? "/index.html" : new URL(request.url, "http://localhost").pathname;
    const filePath = path.resolve(__dirname, `.${pathname}`);
    const allowedRoot = `${__dirname}${path.sep}`;

    if (!filePath.startsWith(allowedRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
      return;
    }

    const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript" };
    response.writeHead(200, { "Content-Type": `${types[path.extname(filePath)] || "application/octet-stream"}; charset=utf-8` });
    response.end(fs.readFileSync(filePath));
  })
  .listen(port, () => console.log(`Local server running at http://localhost:${port}`));
