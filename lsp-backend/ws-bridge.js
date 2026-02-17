// ws-bridge.js
const { spawn } = require("child_process");
const WebSocket = require("ws");

// Start clangd
const clangd = spawn("clangd", ["--compile-commands-dir=/workspace/build"]);

clangd.stdout.on("data", (data) => {
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data.toString());
        }
    });
});

clangd.stderr.on("data", (data) => {
    console.error(`clangd stderr: ${data}`);
});

clangd.on("exit", (code) => {
    console.log(`clangd exited with code ${code}`);
});

// Start WebSocket server
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (message) => {
        // Forward messages to clangd stdin
        clangd.stdin.write(message);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

console.log("WebSocket bridge running on ws://localhost:3001");
