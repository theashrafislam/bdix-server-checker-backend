const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));


// Middleware
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BDIX Server Checker Backend is running!",
        project: "BDIX Server Checker",
        version: "1.0.0",
        status: "online",
        environment: "development",
        server: {
            port: PORT,
            baseURL: `http://localhost:${PORT}`,
        },
        endpoints: {
            home: "/",
            health: "/health",
        },
    });
});


// URL Checker API
// app.get("/api/check-url", async (req, res) => {
//   try {
//     const { url } = req.query;

//     // URL দেওয়া হয়েছে কিনা check
//     if (!url) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a URL",
//       });
//     }

//     // URL valid কিনা check
//     let targetUrl;

//     try {
//       targetUrl = new URL(url);
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid URL",
//       });
//     }

//     // URL-এ request পাঠানো
//     const response = await fetch(targetUrl, {
//       method: "GET",
//       signal: AbortSignal.timeout(10000),
//     });

//     // Result পাঠানো
//     return res.json({
//       success: true,
//       url: targetUrl.href,
//       accessible: true,
//       statusCode: response.status,
//       message: "URL is accessible from this network",
//     });
//   } catch (error) {
//     return res.json({
//       success: true,
//       url: req.query.url || null,
//       accessible: false,
//       message: "URL is not accessible from this network",
//       error: error.message,
//     });
//   }
// });

// Multiple Server Checker API
app.post("/api/check-servers", async (req, res) => {
    try {
        const { servers } = req.body;

        // servers দেওয়া হয়েছে কিনা
        if (!servers || !Array.isArray(servers)) {
            return res.status(400).json({
                success: false,
                message: "Please provide servers array",
            });
        }

        // প্রতিটি server check করার function
        const checkServer = async (server) => {
            const { name, type, url } = server;

            // URL না থাকলে
            if (!url) {
                return {
                    name: name || "Unknown",
                    type: type || "Unknown",
                    url: null,
                    accessible: false,
                    status: "failed",
                    message: "URL is missing",
                };
            }

            // URL valid কিনা
            let targetUrl;

            try {
                targetUrl = new URL(url);
            } catch {
                return {
                    name: name || "Unknown",
                    type: type || "Unknown",
                    url,
                    accessible: false,
                    status: "failed",
                    message: "Invalid URL",
                };
            }

            // শুধু HTTP / HTTPS
            if (!["http:", "https:"].includes(targetUrl.protocol)) {
                return {
                    name: name || "Unknown",
                    type: type || "Unknown",
                    url,
                    accessible: false,
                    status: "failed",
                    message: "Only HTTP and HTTPS URLs are supported",
                };
            }

            // Timer শুরু
            const startTime = Date.now();

            try {
                // Server-এ request
                const response = await fetch(targetUrl, {
                    method: "GET",
                    signal: AbortSignal.timeout(10000),
                });

                // Response time
                const responseTime = Date.now() - startTime;

                return {
                    name: name || "Unknown",
                    type: type || "Unknown",
                    url: targetUrl.href,
                    accessible: true,
                    status: "open",
                    statusCode: response.status,
                    responseTime: responseTime,
                    message: "Server is accessible",
                };

            } catch (error) {
                // Request fail
                const responseTime = Date.now() - startTime;

                return {
                    name: name || "Unknown",
                    type: type || "Unknown",
                    url: targetUrl.href,
                    accessible: false,
                    status: "failed",
                    statusCode: null,
                    responseTime: responseTime,
                    message: "Server is not accessible",
                    error: error.message,
                };
            }
        };

        // সব server একসাথে check
        const results = await Promise.all(
            servers.map((server) => checkServer(server))
        );

        // Count
        const open = results.filter(
            (server) => server.accessible === true
        ).length;

        const failed = results.filter(
            (server) => server.accessible === false
        ).length;

        // Final response
        return res.json({
            success: true,
            total: results.length,
            open: open,
            failed: failed,
            servers: results,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
});

// Health Check Route
app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        message: "Server is working properly!",
    });
});

// Start Server
app.listen(PORT, () => {
    console.log("====================================");
    console.log(" BDIX Server Checker Backend");
    console.log("====================================");
    console.log(` Server: http://localhost:${PORT}`);
    console.log(` Status: Running`);
    console.log(` Environment: development`);
    console.log("====================================");
});