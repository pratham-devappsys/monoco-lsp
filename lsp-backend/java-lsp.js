const { spawn } = require("child_process");
const fs = require("fs").promises;



async function createFile() {
    try {
        await fs.writeFile('C:/Users/Pratham/Desktop/java-workspace/Main.java', "", 'utf8');
        console.log('File "greetings.txt" created successfully');
    } catch (err) {
        console.error('Error creating file:', err);
    }
}

createFile();

const jdtls = spawn("java", [
    "-Declipse.application=org.eclipse.jdt.ls.core.id1",
    "-Dosgi.bundles.defaultStartLevel=4",
    "-Declipse.product=org.eclipse.jdt.ls.core.product",
    "-Dlog.protocol=true",
    "-Dlog.level=ALL",
    "-Xmx1G",
    "-jar",
    "C:/Users/Pratham/Downloads/plugins/org.eclipse.equinox.launcher_1.7.100.v20251111-0406.jar",
    "-configuration",
    "C:/Users/Pratham/Downloads/config_win",
    "-data",
    "C:/Users/Pratham/Desktop/java-workspace"
], {
    shell: false
});

function sendMessage(msg) {
    const json = JSON.stringify(msg);
    const content =
        `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
    jdtls.stdin.write(content);
}

let buffer = "";

jdtls.stdout.on("data", (chunk) => {
    buffer += chunk.toString("utf8");

    while (true) {

        const headerMatch = buffer.match(/^Content-Length:\s*(\d+)\r\n\r\n/i);
        if (!headerMatch) break;

        const contentLength = parseInt(headerMatch[1], 10);
        const headerLength = headerMatch[0].length;

        if (buffer.length < headerLength + contentLength) break;

        const json = buffer.substr(headerLength, contentLength);

        buffer = buffer.substr(headerLength + contentLength);

        try {
            // const message = JSON.parse(json);
            console.log("From JDTLS:", json);
        } catch (err) {
            console.error(" JSON parse error:", err);
            console.log("Raw JSON was:", json);
        }
    }
});



function sleep(ms) {
    console.log(ms);
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    await sleep(1000);

    sendMessage({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            processId: process.pid,
            rootUri: "file:///C:/Users/Pratham/Desktop/java-workspace",
            capabilities: {}
        }
    });

    await sleep(1000);

    sendMessage({
        jsonrpc: "2.0",
        method: "initialized",
        params: {}
    });

    await sleep(2000);

    sendMessage({
        jsonrpc: "2.0",
        method: "textDocument/didOpen",
        params: {
            textDocument: {
                uri: "file:///C:/Users/Pratham/Desktop/java-workspace/Main.java",
                languageId: "java",
                version: 1,
                text: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
`
            }
        }
    });

    await sleep(2000);

    sendMessage({
        jsonrpc: "2.0",
        method: "textDocument/didChange",
        params: {
            textDocument: {
                uri: "file:///C:/Users/Pratham/Desktop/java-workspace/Main.java",

                version: 2
            },   contentChanges: [
                {
                    text:  `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
        System.
    }
}
`
                }
            ]
        }
    });

    await sleep(2000);

    sendMessage({
        jsonrpc: "2.0",
        id: 2,
        method: "textDocument/completion",
        params: {
            textDocument: {
                uri: "file:///C:/Users/Pratham/Desktop/java-workspace/Main.java"
            },
            position: { line:3, character: 15 }
        }
    });

    await sleep(2000);

    // sendMessage({
    //     jsonrpc: "2.0",
    //     id: 3,
    //     method: "textDocument/definition",
    //     params: {
    //         textDocument: {
    //             uri: "file:///C:/Users/Pratham/Desktop/java-workspace/Main.java"
    //         },
    //         position: { line: 0, character: 1 }
    //     }
    // });
}

run();
