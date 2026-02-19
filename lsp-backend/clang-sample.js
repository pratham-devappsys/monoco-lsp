const { spawn } = require("child_process");

const fs = require('fs').promises;

// async function createFile() {
//     try {
//         await fs.writeFile('file:///C:/Users/Pratham/Desktop/test/main.c', '', 'utf8');
//         console.log('File "greetings.txt" created successfully');
//     } catch (err) {
//         console.error('Error creating file:', err);
//     }
// }
//
// createFile();


const clangd = spawn("C:\\Program Files\\LLVM\\bin\\clangd.exe", ["--compile-commands-dir=C:/Users/Pratham/Desktop/test" ,"--background-index"], {
    shell: false
});

// clangd.stdout.on("data", (data) => console.log(data.toString()));
// clangd.stderr.on("data", (data) => console.error(data.toString()));


function sendMessage(msg) {
    const json = JSON.stringify(msg);
    const content = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
    clangd.stdin.write(content);
}


let buffer = "";

clangd.stdout.on("data", (data) => {
    buffer += data.toString("utf8");

    while (true) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;

        const header = buffer.slice(0, headerEnd);
        const match = header.match(/Content-Length: (\d+)/i);
        if (!match) return;

        const contentLength = parseInt(match[1], 10);
        const totalLength = headerEnd + 4 + contentLength;

        if (buffer.length < totalLength) return;

        const body = buffer.slice(headerEnd + 4, totalLength);
        buffer = buffer.slice(totalLength);

        try {
            const message = JSON.parse(body);
            console.log("From clangd:", message);
        } catch (err) {
            console.error("JSON parse error:", err);
        }
    }
});

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {

    sendMessage({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            processId: process.pid,
            rootUri: "file:///C:/Users/Pratham/Desktop/test",
            capabilities: {}
        }
    });

    await sleep(1000);

    sendMessage({
        jsonrpc: "2.0",
        method: "initialized",
        params: {}
    });

    await sleep(500);

    sendMessage({
        jsonrpc: "2.0",
        method: "textDocument/didOpen",
        params: {
            textDocument: {
                uri: "file:///C:/Users/Pratham/Desktop/test/main.c",
                languageId: "c",
                version: 1,
                text: "#include <stdio.h>\nint mn() { printf(\"Hello\"); return 0; }"
            }
        }
    });

    await sleep(500);

    sendMessage({
        jsonrpc: "2.0",
        method: "textDocument/didChange",
        params: {
            textDocument: {
                uri: "file:///C:/Users/Pratham/Desktop/test/main.c",

                version: 2,

            }, contentChanges: [
                {
                    text: "#"
                }
            ]
        }
    });

    await sleep(500);

    sendMessage({
        jsonrpc: "2.0",
        id: 2,
        method: "textDocument/completion",
        params: {
            textDocument: {
                uri: "file:///C:/Users/Pratham/Desktop/test/main.c"
            },
            position: { line: 0, character: 1 }
        }
    });

    await sleep(500);

    sendMessage({
        jsonrpc: "2.0",
        id: 3,
        method: "textDocument/definition",
        params: {
            textDocument: {
                uri: "file:///C:/Users/Pratham/Desktop/test/main.c"
            },
            position: { line: 1, character: 20 }
        }
    });
}

run();
