// Import required Node.js modules
const http = require("http");   // For creating HTTP server
const url = require("url");     // For parsing URLs
const fs = require("fs");       // For file system operations (read/write files)
const path = require("path");   // For handling file and directory paths
const Utils = require("./modules/utils"); // Custom utility module (for greeting with date/time)

class MyServer {
    // Constructor: sets hostname, port, and prepares the server
    constructor(hostname = "0.0.0.0", port = 3000) {
        this.hostname = hostname;  // Server hostname (0.0.0.0 to bind all interfaces)
        this.port = port;          // Server port number

        // Create HTTP server and bind request handler
        this.server = http.createServer(this.requestHandler.bind(this));

        // Ensure "data" directory exists for storing files
        this.dataDir = path.join(__dirname, "data");
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir); // Create directory if it doesn't exist
        }
    }

    // Start the server and listen on the specified hostname and port
    start() {
        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }

    // Main request handler: routes incoming requests based on URL
    requestHandler(req, res) {
        const parsedUrl = url.parse(req.url, true);      // Parse request URL
        const pathname = parsedUrl.pathname.replace(/\/$/, ""); // Remove trailing slash

        // Route requests based on path
        if (pathname === "" || pathname === "/") {
            this.handleHome(res); // Home page
        } else if (pathname === "/COMP4537/labs/3/getDate") {
            this.handleGetDate(parsedUrl.query, res); // Handle greeting with date
        } else if (pathname === "/COMP4537/labs/3/writeFile") {
            this.handleWriteFile(parsedUrl.query, res); // Handle writing to file
        } else if (pathname.startsWith("/COMP4537/labs/3/readFile")) {
            const fileName = pathname.split("/").pop(); // Extract filename from URL
            this.handleReadFile(fileName, res);        // Handle reading file
        } else {
            this.send404(res); // Any unknown path → 404
        }
    }

    // ===== Home Page =====
    handleHome(res) {
        // HTML form for greeting, writing, and reading files
        const html = `
        <html>
        <head>
            <meta charset="UTF-8"> <!-- Fix character encoding -->
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
        // Send HTML response with UTF-8 encoding
        res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
        res.end(html);
    }

    // ===== Get Greeting & Date =====
    handleGetDate(query, res) {
        const name = query.name; // Extract 'name' from query string
        if (!name) {
            // Name missing → send error page
            res.writeHead(400, { "Content-Type": "text/html; charset=UTF-8" });
            res.end(`<p style="color:red;">Error: Name is required</p>
                     <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            return;
        }

        // Send greeting message with date/time
        res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
        res.end(`${Utils.getDate(name)}<br><br><button onclick="window.location.href='/'">⬅ Back</button>`);
    }

    // ===== Write Text to File =====
    handleWriteFile(query, res) {
        const text = query.text; // Extract 'text' from query string
        if (!text) {
            // Text missing → send error page
            res.writeHead(400, { "Content-Type": "text/html; charset=UTF-8" });
            res.end(`<p style="color:red;">Error: Text is required</p>
                     <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            return;
        }

        // Append text to "file.txt" inside the data directory
        const filePath = path.join(this.dataDir, "file.txt");
        fs.appendFile(filePath, text + "\n", (err) => {
            if (err) {
                // Error writing file → send error page
                res.writeHead(500, { "Content-Type": "text/html; charset=UTF-8" });
                res.end(`<p style="color:red;">Error writing file: ${err.message}</p>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            } else {
                // Success → send confirmation page
                res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
                res.end(`<p style="color:blue;">Appended "${text}" to file.txt</p>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            }
        });
    }

    // ===== Read File =====
    handleReadFile(fileName, res) {
        const filePath = path.join(this.dataDir, fileName);
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                // Determine error code and message
                const code = err.code === "ENOENT" ? 404 : 500;
                const msg = err.code === "ENOENT" ? `File "${fileName}" not found` : err.message;
                // Send error response
                res.writeHead(code, { "Content-Type": "text/html; charset=UTF-8" });
                res.end(`<p style="color:red;">Error: ${msg}</p>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            } else {
                // Success → send file content
                res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
                res.end(`<pre style="color:blue;">${data}</pre>
                         <br><button onclick="window.location.href='/'">⬅ Back</button>`);
            }
        });
    }

    // ===== 404 Not Found =====
    send404(res) {
        res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
        res.end(`<p style="color:red;">404 Not Found</p>
                 <br><button onclick="window.location.href='/'">⬅ Back</button>`);
    }
}

// ===== Start Server =====
const PORT = process.env.PORT || 3000; // Use Render-assigned PORT or fallback to 3000
const HOST = "0.0.0.0";                // Bind to all network interfaces

const server = new MyServer(HOST, PORT); // Create server instance
server.start();                          // Start server
