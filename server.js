// Little Artists — tiny static server (kids coloring & learning PWA)
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p === "/") p = "/index.html";
  const fp = path.normalize(path.join(ROOT, p));
  if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(fp, (e, data) => {
    if (e) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(fp).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(data);
  });
}).listen(process.env.PORT || 4100, "0.0.0.0", () => {
  const nets = os.networkInterfaces(); let lan = "localhost";
  for (const k in nets) for (const n of nets[k]) if (n.family === "IPv4" && !n.internal) lan = n.address;
  console.log(`🎨 Little Artists — http://localhost:${process.env.PORT || 4100}  |  phones: http://${lan}:${process.env.PORT || 4100}`);
});
