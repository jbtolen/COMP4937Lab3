// Import required Node.js modules
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
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
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
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

    handleHome(res) {
        const html = `
        <html>
        <head><title>Greeting & File Page</title></head>
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

    handleGetDate(query, res) {
        const name = query.name;
        if (!name) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`<p style="color:red;">Error: Name is required</p>
                     <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`${Utils.getDate(name)}<br><br><button onclick="window.location.href='/'">⬅ Back</button>`);
    }

    handleWriteFile(query, res) {
        const text = query.text;
        if (!text) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`<p style="color:red;">Error: Text is required</p>
                     <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            return;
        }

        const filePath = path.join(this.dataDir, "file.txt");
        fs.appendFile(filePath, text + "\n", (err) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end(`<p style="color:red;">Error writing file: ${err.message}</p>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(`<p style="color:blue;">Appended "${text}" to file.txt</p>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            }
        });
    }

    handleReadFile(fileName, res) {
        const filePath = path.join(this.dataDir, fileName);
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                const code = err.code === "ENOENT" ? 404 : 500;
                const msg = err.code === "ENOENT" ? `File "${fileName}" not found` : err.message;
                res.writeHead(code, { "Content-Type": "text/html" });
                res.end(`<p style="color:red;">Error: ${msg}</p>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(`<pre style="color:blue;">${data}</pre>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            }
        });
    }

    send404(res) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`<p style="color:red;">404 Not Found</p>
                 <br><button onclick="window.location.href='/'">⬅ Back</button>`);
    }
}

// ===== Start server =====
const PORT = process.env.PORT || 3000; // Render will assign PORT
const HOST = "0.0.0.0";                // Bind to all network interfaces

const server = new MyServer(HOST, PORT);
server.start();
