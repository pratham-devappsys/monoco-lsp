const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// --------------------
// 1. Python file to analyze
// --------------------
const filePath = path.resolve(__dirname, "app.py"); // full path to your Python file
const fileUri = `file://${filePath}`;               // LSP file URI format
const fileText = fs.readFileSync(filePath, "utf8");

console.log("File URI:", fileUri);
console.log("File Text:\n", fileText);

// --------------------
// 2. Spawn Pyright LSP
// --------------------

const lsp = spawn( "C:\\Users\\Pratham\\AppData\\Roaming\\npm\\pyright-langserver.cmd", ["--stdio"], {
  shell: true, // important on Windows
});

lsp.on("error", (err) => {
    console.error("Failed to start Pyright LSP:", err);
});

// --------------------
// 3. Helper to send messages to LSP
// --------------------
function sendMessage(msg) {
    const json = JSON.stringify(msg);
    const content = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
    lsp.stdin.write(content);
}

// --------------------
// 4. Parse LSP responses
// --------------------
let buffer = "";
lsp.stdout.on("data", (data) => {
    buffer += data.toString();
    let parts = buffer.split("\r\n\r\n");
    while (parts.length > 1) {
        const headers = parts.shift();
        const body = parts.shift();
        try {
            const json = JSON.parse(body);
            console.log("LSP Response:", JSON.stringify(json, null, 2));
        } catch (e) {
            // ignore parse errors
        }
    }
});

// --------------------
// 5. Initialize LSP
// --------------------
sendMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        rootUri: `file://${path.dirname(filePath)}`, // workspace is the folder of the file
        capabilities: {},
        initializationOptions: {
            include: [filePath]  // only include this single Python file
        }
    }
});

// Notify server initialization done
sendMessage({
    jsonrpc: "2.0",
    method: "initialized",
    params: {}
});

// --------------------
// 6. Open the Python file
// --------------------
sendMessage({
    jsonrpc: "2.0",
    method: "textDocument/didOpen",
    params: {
        textDocument: {
            uri: fileUri,
            languageId: "python",
            version: 1,
            text: fileText
        }
    }
});

console.log("Sent Python file to Pyright LSP.");
