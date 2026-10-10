import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(directory, "public");
try {
  const values = await readFile(path.join(directory, ".env"), "utf8");
  for (const line of values.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
} catch {}

const mimeTypes = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/config.js") {
    response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
    response.end(`window.VULCAN_CONFIG=${JSON.stringify({
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:4000",
      clientFrontendUrl: process.env.CLIENT_FRONTEND_URL || "http://localhost:3000",
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    })};`);
    return;
  }
  const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filename = path.resolve(publicDirectory, requested);
  if (!filename.startsWith(`${publicDirectory}${path.sep}`) && filename !== path.join(publicDirectory, "index.html")) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const content = await readFile(filename);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filename)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
});

const port = Number(process.env.PORT || 3002);
server.listen(port, "0.0.0.0", () => console.log(`Vulcan admin frontend at http://localhost:${port}`));
