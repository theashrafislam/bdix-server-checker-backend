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

app.post("/api/check-servers", async (req, res) => {

    try {

        // ==================================================
        // GET SERVERS
        // ==================================================

        const { servers } = req.body;


        // ==================================================
        // VALIDATE SERVERS
        // ==================================================

        if (!Array.isArray(servers)) {

            return res.status(400).json({
                success: false,
                message: "servers must be an array"
            });
        }


        if (servers.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Please provide at least one server"
            });
        }


        // ==================================================
        // CHECK SERVER FUNCTION
        // ==================================================

        const checkServer = async (server) => {

            const name =
                server?.name || "Unknown";

            const type =
                server?.type || "Unknown";

            const url =
                server?.url || null;


            // ==================================================
            // URL MISSING
            // ==================================================

            if (!url) {

                return {

                    name,

                    type,

                    url: null,

                    accessible: false,

                    status: "failed",

                    statusCode: null,

                    responseTime: 0,

                    message: "URL is missing"
                };
            }


            // ==================================================
            // URL VALIDATION
            // ==================================================

            let targetUrl;

            try {

                targetUrl = new URL(url);

            } catch {

                return {

                    name,

                    type,

                    url,

                    accessible: false,

                    status: "failed",

                    statusCode: null,

                    responseTime: 0,

                    message: "Invalid URL"
                };
            }


            // ==================================================
            // HTTP / HTTPS CHECK
            // ==================================================

            if (
                targetUrl.protocol !== "http:" &&
                targetUrl.protocol !== "https:"
            ) {

                return {

                    name,

                    type,

                    url,

                    accessible: false,

                    status: "failed",

                    statusCode: null,

                    responseTime: 0,

                    message:
                        "Only HTTP and HTTPS URLs are supported"
                };
            }


            // ==================================================
            // START TIMER
            // ==================================================

            const startTime = Date.now();


            try {

                // ==================================================
                // REQUEST SERVER
                // ==================================================

                const response = await fetch(
                    targetUrl,
                    {
                        method: "GET",

                        signal:
                            AbortSignal.timeout(20000)
                    }
                );


                // ==================================================
                // RESPONSE TIME
                // ==================================================

                const responseTime =
                    Date.now() - startTime;


                // ==================================================
                // SUCCESS
                // ==================================================

                return {

                    name,

                    type,

                    url: targetUrl.href,

                    accessible: true,

                    status: "open",

                    statusCode:
                        response.status,

                    responseTime,

                    message:
                        "Server is accessible"
                };


            } catch (error) {

                // ==================================================
                // FAILED
                // ==================================================

                const responseTime =
                    Date.now() - startTime;


                return {

                    name,

                    type,

                    url: targetUrl.href,

                    accessible: false,

                    status: "failed",

                    statusCode: null,

                    responseTime,

                    message:
                        "Server is not accessible",

                    error:
                        error.message
                };
            }
        };


        // ==================================================
        // CHECK ALL SERVERS
        // ==================================================

        const results = [];

        for (const server of servers) {

            const result =
                await checkServer(server);

            results.push(result);
        }


        // ==================================================
        // COUNT RESULTS
        // ==================================================

        const open =
            results.filter(
                server => server.accessible
            ).length;


        const failed =
            results.filter(
                server => !server.accessible
            ).length;


        // ==================================================
        // FINAL JSON RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            total:
                servers.length,

            completed:
                results.length,

            open,

            failed,

            pending: 0,

            progress: 100,

            servers:
                results,

            message:
                "Server checking completed"
        });


    } catch (error) {

        console.error(
            "Server checking error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Something went wrong",

            error:
                error.message
        });
    }
});


// Multiple Server Checker API
// app.post("/api/check-servers", async (req, res) => {

//     // ==================================================
//     // CORS
//     // ==================================================

//     res.setHeader(
//         "Access-Control-Allow-Origin",
//         "*"
//     );

//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "GET, POST, OPTIONS"
//     );

//     res.setHeader(
//         "Access-Control-Allow-Headers",
//         "Content-Type"
//     );


//     // ==================================================
//     // SSE / STREAM HEADERS
//     // ==================================================

//     res.setHeader(
//         "Content-Type",
//         "text/event-stream; charset=utf-8"
//     );

//     res.setHeader(
//         "Cache-Control",
//         "no-cache, no-transform"
//     );

//     res.setHeader(
//         "Connection",
//         "keep-alive"
//     );

//     res.setHeader(
//         "X-Accel-Buffering",
//         "no"
//     );


//     // IMPORTANT: HEADERS IMMEDIATELY SEND
//     res.flushHeaders();

//     // ==================================================
//     // SEND EVENT FUNCTION
//     // ==================================================

//     const sendEvent = (data) => {

//         try {

//             res.write(
//                 `data: ${JSON.stringify(data)}\n\n`
//             );

//         } catch (error) {

//             console.error(
//                 "Stream write error:",
//                 error.message
//             );
//         }
//     };


//     try {

//         // ==================================================
//         // REQUEST BODY
//         // ==================================================

//         const { servers } = req.body;


//         // ==================================================
//         // VALIDATE SERVERS
//         // ==================================================

//         if (
//             !servers ||
//             !Array.isArray(servers)
//         ) {

//             sendEvent({
//                 type: "error",
//                 success: false,
//                 message:
//                     "Please provide servers array"
//             });

//             return res.end();
//         }


//         // ==================================================
//         // TOTAL
//         // ==================================================

//         const total =
//             servers.length;


//         let completed = 0;

//         let open = 0;

//         let failed = 0;


//         const results = [];


//         // ==================================================
//         // INITIAL EVENT
//         // ==================================================

//         sendEvent({

//             type: "start",

//             success: true,

//             total: total,

//             completed: 0,

//             open: 0,

//             failed: 0,

//             pending: total,

//             message:
//                 "Server checking started"
//         });


//         // ==================================================
//         // CHECK SERVER FUNCTION
//         // ==================================================

//         const checkServer = async (server) => {

//             const {
//                 name,
//                 type,
//                 url
//             } = server;


//             // ------------------------------------------------
//             // URL MISSING
//             // ------------------------------------------------

//             if (!url) {

//                 return {

//                     name:
//                         name || "Unknown",

//                     type:
//                         type || "Unknown",

//                     url: null,

//                     accessible: false,

//                     status: "failed",

//                     statusCode: null,

//                     responseTime: 0,

//                     message:
//                         "URL is missing"
//                 };
//             }


//             // ------------------------------------------------
//             // URL VALIDATION
//             // ------------------------------------------------

//             let targetUrl;


//             try {

//                 targetUrl =
//                     new URL(url);

//             } catch {

//                 return {

//                     name:
//                         name || "Unknown",

//                     type:
//                         type || "Unknown",

//                     url: url,

//                     accessible: false,

//                     status: "failed",

//                     statusCode: null,

//                     responseTime: 0,

//                     message:
//                         "Invalid URL"
//                 };
//             }


//             // ------------------------------------------------
//             // PROTOCOL CHECK
//             // ------------------------------------------------

//             if (
//                 ![
//                     "http:",
//                     "https:"
//                 ].includes(
//                     targetUrl.protocol
//                 )
//             ) {

//                 return {

//                     name:
//                         name || "Unknown",

//                     type:
//                         type || "Unknown",

//                     url: url,

//                     accessible: false,

//                     status: "failed",

//                     statusCode: null,

//                     responseTime: 0,

//                     message:
//                         "Only HTTP and HTTPS URLs are supported"
//                 };
//             }


//             // ------------------------------------------------
//             // START TIMER
//             // ------------------------------------------------

//             const startTime =
//                 Date.now();


//             try {

//                 // ------------------------------------------------
//                 // REQUEST SERVER
//                 // ------------------------------------------------

//                 const response =
//                     await fetch(
//                         targetUrl,
//                         {
//                             method: "GET",

//                             signal:
//                                 AbortSignal.timeout(
//                                     20000
//                                 )
//                         }
//                     );


//                 // ------------------------------------------------
//                 // RESPONSE TIME
//                 // ------------------------------------------------

//                 const responseTime =
//                     Date.now() -
//                     startTime;


//                 return {

//                     name:
//                         name || "Unknown",

//                     type:
//                         type || "Unknown",

//                     url:
//                         targetUrl.href,

//                     accessible: true,

//                     status: "open",

//                     statusCode:
//                         response.status,

//                     responseTime:
//                         responseTime,

//                     message:
//                         "Server is accessible"
//                 };


//             } catch (error) {

//                 // ------------------------------------------------
//                 // FAILED REQUEST
//                 // ------------------------------------------------

//                 const responseTime =
//                     Date.now() -
//                     startTime;


//                 return {

//                     name:
//                         name || "Unknown",

//                     type:
//                         type || "Unknown",

//                     url:
//                         targetUrl.href,

//                     accessible: false,

//                     status: "failed",

//                     statusCode: null,

//                     responseTime:
//                         responseTime,

//                     message:
//                         "Server is not accessible",

//                     error:
//                         error.message
//                 };
//             }
//         };


//         // ==================================================
//         // CHECK SERVERS ONE BY ONE
//         // ==================================================

//         for (
//             let i = 0;
//             i < servers.length;
//             i++
//         ) {

//             const server =
//                 servers[i];


//             const current =
//                 i + 1;


//             // ------------------------------------------------
//             // TELL FRONTEND WHICH SERVER IS CURRENTLY CHECKING
//             // ------------------------------------------------

//             sendEvent({

//                 type: "checking",

//                 current: current,

//                 total: total,

//                 completed: completed,

//                 open: open,

//                 failed: failed,

//                 pending:
//                     total - completed,

//                 name:
//                     server.name ||
//                     "Unknown",

//                 serverType:
//                     server.type ||
//                     "Unknown",

//                 url:
//                     server.url ||
//                     null,

//                 progress:
//                     Math.round(
//                         (
//                             completed /
//                             total
//                         ) * 100
//                     ),

//                 message:
//                     `Checking ${server.name ||
//                     "Unknown"
//                     }`
//             });


//             // ------------------------------------------------
//             // CHECK SERVER
//             // ------------------------------------------------

//             const result =
//                 await checkServer(
//                     server
//                 );


//             // ------------------------------------------------
//             // ADD RESULT
//             // ------------------------------------------------

//             results.push(
//                 result
//             );


//             // ------------------------------------------------
//             // UPDATE COUNTERS
//             // ------------------------------------------------

//             completed++;


//             if (
//                 result.accessible === true
//             ) {

//                 open++;

//             } else {

//                 failed++;
//             }


//             const pending =
//                 total -
//                 completed;


//             const progress =
//                 Math.round(
//                     (
//                         completed /
//                         total
//                     ) * 100
//                 );


//             // ------------------------------------------------
//             // SEND RESULT IMMEDIATELY
//             // ------------------------------------------------

//             sendEvent({

//                 type: "result",

//                 current: current,

//                 total: total,

//                 completed:
//                     completed,

//                 open:
//                     open,

//                 failed:
//                     failed,

//                 pending:
//                     pending,

//                 progress:
//                     progress,

//                 result:
//                     result
//             });

//         }


//         // ==================================================
//         // FINAL RESULT
//         // ==================================================

//         sendEvent({

//             type: "complete",

//             success: true,

//             total:
//                 total,

//             completed:
//                 completed,

//             open:
//                 open,

//             failed:
//                 failed,

//             pending: 0,

//             progress: 100,

//             servers:
//                 results,

//             message:
//                 "Server checking completed"
//         });


//         // ==================================================
//         // END STREAM
//         // ==================================================

//         return res.end();


//     } catch (error) {

//         console.error(
//             "Server checking error:",
//             error
//         );


//         // ------------------------------------------------
//         // SEND ERROR
//         // ------------------------------------------------

//         sendEvent({

//             type: "error",

//             success: false,

//             message:
//                 "Something went wrong",

//             error:
//                 error.message
//         });


//         return res.end();
//     }

// });

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