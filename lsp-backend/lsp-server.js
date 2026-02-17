const {
  createServerProcess,
  forward
} = require("vscode-ws-jsonrpc");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

console.log("LSP WebSocket running at ws://localhost:3001");

wss.on("connection", (socket) => {
  console.log("Client connected");

  const serverProcess = createServerProcess(
    "python",
    "pyright-langserver",
    ["--stdio"]
  );

  forward(socket, serverProcess);
});
