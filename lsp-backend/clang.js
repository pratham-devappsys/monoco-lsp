const { spawn } = require("child_process");

// --------------------
// 1. C code to analyze
// --------------------
const code = `
#include <stdio.h>

int main() {
    printf("Hello, LSP!\\n");
    ret  ;
}
`;

const fakeFileUri = "file:///direct_code.c"; // fake file URI for LSP

// --------------------
// 2. Spawn clangd LSP
// --------------------
const lsp = spawn("clangd", ["--compile-commands-dir=.", "--log=verbose"], {
    shell: true, // needed on Windows
});

lsp.on("error", (err) => console.error("Failed to start clangd:", err));

function sendMessage(msg) {
    const json = JSON.stringify(msg);
    const content = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
    lsp.stdin.write(content);
}

// --------------------
// 4. Receive LSP responses
// --------------------
let buffer = "";
lsp.stdout.on("data", (data) => {
    buffer += data.toString();
    let parts = buffer.split("\r\n\r\n");
    while (parts.length > 1) {
        parts.shift(); // headers
        const body = parts.shift();
        try {
            const json = JSON.parse(body);
            console.log("LSP Response:", JSON.stringify(json, null, 2));
        } catch {}
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
        rootUri: "file:///", // workspace root
        capabilities: {},
        initializationOptions: {
            compilationDatabasePath: "." // optional, for flags
        }
    }
});

// --------------------
// 6. Notify initialized
// --------------------
sendMessage({
    jsonrpc: "2.0",
    method: "initialized",
    params: {}
});

// --------------------
// 7. Open the “file” with the code
// --------------------
sendMessage({
    jsonrpc: "2.0",
    method: "textDocument/didOpen",
    params: {
        textDocument: {
            uri: fakeFileUri,
            languageId: "c",
            version: 1,
            text: code
        }
    }
});

console.log("Sent C code to clangd LSP.");
