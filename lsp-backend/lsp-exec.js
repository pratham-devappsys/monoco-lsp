const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");


const code = `def hello():\n    print'Hello World')\nhello()`;


const tempFilePath = path.resolve(__dirname, "dummy_test.py");
fs.writeFileSync(tempFilePath, code, "utf8");
console.log("Created dummy file at:", tempFilePath);


exec(`pyright "${tempFilePath}" --outputjson`, (err, stdout, stderr) => {

    try {
        const json = JSON.parse(stdout);
        console.log("Diagnostics:", JSON.stringify(json, null, 2));
    } catch (e) {
        console.error("Failed to parse JSON:", e);
    }
});
