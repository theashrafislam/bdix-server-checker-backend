const express = require("express");

const app = express();
const PORT = 5000;

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
app.get("/api/check-url", async (req, res) => {
  try {
    const { url } = req.query;

    // URL দেওয়া হয়েছে কিনা check
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Please provide a URL",
      });
    }

    // URL valid কিনা check
    let targetUrl;

    try {
      targetUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }

    // URL-এ request পাঠানো
    const response = await fetch(targetUrl, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });

    // Result পাঠানো
    return res.json({
      success: true,
      url: targetUrl.href,
      accessible: true,
      statusCode: response.status,
      message: "URL is accessible from this network",
    });
  } catch (error) {
    return res.json({
      success: true,
      url: req.query.url || null,
      accessible: false,
      message: "URL is not accessible from this network",
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