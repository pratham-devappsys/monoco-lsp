const { spawn } = require("child_process");
const fs = require('fs');

const code1 = `import math`;

const code2 = `import math\nma`;


const fakeUri = "file:///dummy.py";

const lsp = spawn(
    "C:\\Users\\Pratham\\AppData\\Roaming\\npm\\pyright-langserver.cmd",
    ["--stdio"],
    { shell: true }
);


function sendMessage(msg) {
    const json = JSON.stringify(msg);
    const content = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
    lsp.stdin.write(content);
}

let buffer = "";
lsp.stdout.on("data", (data) => {
    buffer += data.toString();
    let parts = buffer.split("\r\n\r\n");
    while (parts.length > 1) {
        parts.shift(); // remove headers
        const body = parts.shift();
        try {
            const json = JSON.parse(body);

            console.log("method =",json.method ,"-----------",json);


        } catch {}
    }
});


sendMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        rootUri: "file:///",
        capabilities: {}
    }
});



setTimeout(() => sendMessage({ jsonrpc: "2.0", method: "initialized", params: {} }), 50);

setTimeout(() => sendMessage({
    jsonrpc: "2.0",
    method: "textDocument/didOpen",
    params: { textDocument: { uri: fakeUri, languageId: "python", version: 1, text: code1 } }
}), 100);

setTimeout(() => sendMessage({
    jsonrpc: "2.0",
    method: "textDocument/didChange",
    params: { textDocument: { uri: fakeUri, version: 2 }, contentChanges: [{ text: code2 }] }
}), 150);

setTimeout(() => sendMessage({
    jsonrpc: "2.0",
    id: 3,
    method: "textDocument/completion",
    params: { textDocument: { uri: fakeUri }, position: { line: 1, character: 2 } }
}), 350);

setTimeout(() => sendMessage({
    jsonrpc: "2.0",
    id: 4,
    method: "textDocument/definition",
    params: { textDocument: { uri: fakeUri }, position: { line: 1, character: 1 } }
}), 400);

// Keep Node process alive for 1 second to collect all responses
setTimeout(() => {
    console.log("Finished all requests. Exiting.");
    // lsp.kill(); // gracefully terminate Pyright LSP
}, 1000);
// sendMessage({
//     jsonrpc: "2.0",
//     id: 2,
//     method: "textDocument/definition",
//     params: {
//         textDocument: { uri: fakeUri,
//             languageId: "python",
//             version: 2,
//             text: code2
//         },
//         position: { line: 2, character: 5 } // cursor after 'math.'
//     }
// });

