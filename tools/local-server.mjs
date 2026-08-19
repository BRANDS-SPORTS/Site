import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = Number(process.argv[2] ?? 4173);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Porta inválida. Use um número entre 1 e 65535.");
  process.exit(1);
}

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const projectRoot = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const rootPrefix = `${projectRoot}${sep}`;
const isInsideProject = (filePath) =>
  filePath === projectRoot || filePath.startsWith(rootPrefix);

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(message);
}

const server = createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("Allow", "GET, HEAD");
      sendText(response, 405, "Método não permitido");
      return;
    }

    const encodedPath = (request.url ?? "/").split("?", 1)[0];
    let decodedPath;

    try {
      decodedPath = decodeURIComponent(encodedPath).replaceAll("\\", "/");
    } catch {
      sendText(response, 400, "URL inválida");
      return;
    }

    if (decodedPath.includes("\0") || decodedPath.split("/").includes("..")) {
      sendText(response, 403, "Acesso negado");
      return;
    }

    const relativePath = decodedPath.replace(/^\/+/, "") || "index.html";
    let filePath = resolve(projectRoot, relativePath);

    if (!isInsideProject(filePath)) {
      sendText(response, 403, "Acesso negado");
      return;
    }

    let fileStat;
    try {
      fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        filePath = resolve(filePath, "index.html");
        fileStat = await stat(filePath);
      }
      filePath = await realpath(filePath);
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") {
        sendText(response, 404, "Arquivo não encontrado");
        return;
      }
      throw error;
    }

    if (!fileStat.isFile() || !isInsideProject(filePath)) {
      sendText(response, 403, "Acesso negado");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Length": fileStat.size,
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) {
      sendText(response, 500, "Erro interno do servidor");
    } else {
      response.destroy();
    }
  }
});

server.listen(port, host, () => {
  console.log(`Site disponível em http://${host}:${port}`);
});
