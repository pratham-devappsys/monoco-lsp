const express = require("express");
const { WebSocketServer } = require("ws");
const { spawn } = require("child_process");

const app = express();


const server = app.listen(3001, () => {
  console.log("LSP WebSocket running on ws://localhost:3001");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {

  console.log("Client connected");

  // Start Pyright LSP
  const pyright = spawn("powershell.exe", [
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    "C:\\Users\\Pratham\\AppData\\Roaming\\npm\\pyright-langserver.ps1",
    "--stdio"
  ]);


  // const pyright = spawn("npx", ["pyright-langserver", "--stdio"], {
  //   shell: true, // important on Windows
  // });




  let buffer = "";

  // Client → Pyright
  socket.on("message", (message) => {
    function sendToPyright(obj) {
      const json = JSON.stringify(obj);
      const message = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
      pyright.stdin.write(message);
    }

  });

  // Pyright → Client
  pyright.stdout.on("data", (data) => {
    console.log("Raw from Pyright:", data.toString());

    buffer += data.toString();

    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) break;

      const header = buffer.slice(0, headerEnd);
      const match = header.match(/Content-Length: (\d+)/i);
      if (!match) break;

      const contentLength = parseInt(match[1], 10);
      const totalLength = headerEnd + 4 + contentLength;

      if (buffer.length < totalLength) break;

      const message = buffer.slice(headerEnd + 4, totalLength);

      console.log("From Pyright:", message);

      socket.send(message);

      buffer = buffer.slice(totalLength);
    }
  });

  pyright.stderr.on("data", (data) => {
    console.error("Pyright Error:", data.toString());
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    pyright.kill();
  });

  pyright.on("close", (code) => {
    console.log("Pyright exited with code", code);
  });

});



