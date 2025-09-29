// Import required Node.js modules
const http = require("http");   // for creating the HTTP server
const url = require("url");     // for parsing request URLs
const fs = require("fs");       // for reading/writing files
const path = require("path");   // for handling file paths
const Utils = require("./modules/utils");  // custom utility module

class MyServer {
    constructor(hostname = "0.0.0.0", port = 3000) {
        this.hostname = hostname;
        this.port = port;

        this.server = http.createServer(this.requestHandler.bind(this));

        // Ensure a "data" directory exists
        this.dataDir = path.join(__dirname, "data");
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir);
        }
    }

    start() {
        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://localhost:${this.port}/`);
        });
    }

    requestHandler(req, res) {
        let parsedUrl = url.parse(req.url, true);
        let pathname = parsedUrl.pathname.replace(/\/$/, "");

        if (pathname === "" || pathname === "/") {
            this.handleHome(res);
        }
        else if (pathname === "/COMP4537/labs/3/getDate") {
            this.handleGetDate(parsedUrl.query, res);
        }
        else if (pathname === "/COMP4537/labs/3/writeFile") {
            this.handleWriteFile(parsedUrl.query, res);
        }
        else if (pathname.startsWith("/COMP4537/labs/3/readFile")) {
            const fileName = pathname.split("/").pop();
            this.handleReadFile(fileName, res);
        }
        else {
            this.send404(res);
        }
    }

    // ===== Home Page =====
    handleHome(res) {
        const html = `
        <html>
        <head>
            <title>Greeting & File Page</title>
        </head>
        <body>
            <h2>Greeting Form</h2>
            <form action="/COMP4537/labs/3/getDate" method="GET">
                <input type="text" name="name" placeholder="Your name" required>
                <button type="submit">Greet Me</button>
            </form>

            <h2>Write to File</h2>
            <form action="/COMP4537/labs/3/writeFile" method="GET">
                <input type="text" name="text" placeholder="Enter text to save" required>
                <button type="submit">Save to File</button>
            </form>

            <h2>Read from File</h2>
            <form action="/COMP4537/labs/3/readFile/file.txt" method="GET">
                <button type="submit">Read File</button>
            </form>
        </body>
        </html>`;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }

    // ===== Get Date =====
    handleGetDate(query, res) {
        const name = query.name;
        if (!name) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`
                <p style="color:red;">Error: Name is required in query string (?name=YourName)</p>
                <br><button onclick="window.location.href='/'">⬅ Back</button>
            `);
            return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
            ${Utils.getDate(name)}
            <br><br>
            <button onclick="window.location.href='/'">⬅ Back</button>
        `);
    }

    // ===== Write File =====
    handleWriteFile(query, res) {
        const text = query.text;
        if (!text) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`
                <p style="color:red;">Error: Query string ?text= is required</p>
                <br><button onclick="window.location.href='/'">⬅ Back</button>
            `);
            return;
        }

        const filePath = path.join(this.dataDir, "file.txt");

        fs.appendFile(filePath, text + "\n", (err) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end(`
                    <p style="color:red;">Error writing to file: ${err.message}</p>
                    <br><button onclick="window.location.href='/'">⬅ Back</button>
                `);
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(`
                    <p style="color:blue;">Successfully appended "${text}" to file.txt</p>
                    <br><button onclick="window.location.href='/'">⬅ Back</button>
                `);
            }
        });
    }

    // ===== Read File =====
    handleReadFile(fileName, res) {
        const filePath = path.join(this.dataDir, fileName);

        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    res.writeHead(404, { "Content-Type": "text/html" });
                    res.end(`
                        <p style="color:red;">404: File "${fileName}" not found</p>
                        <br><button onclick="window.location.href='/'">⬅ Back</button>
                    `);
                } else {
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.end(`
                        <p style="color:red;">Error reading file: ${err.message}</p>
                        <br><button onclick="window.location.href='/'">⬅ Back</button>
                    `);
                }
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(`
                    <pre style="color:blue;">${data}</pre>
                    <br><button onclick="window.location.href='/'">⬅ Back</button>
                `);
            }
        });
    }

    // ===== 404 =====
    send404(res) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`
            <p style="color:red;">404 Not Found</p>
            <br><button onclick="window.location.href='/'">⬅ Back</button>
        `);
    }
}

// Start server
const server = new MyServer();
server.start();
