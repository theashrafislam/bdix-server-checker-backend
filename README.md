# BDIX Server Checker

A simple and beginner-friendly backend API built with **Node.js** and **Express.js** to check whether HTTP/HTTPS servers are accessible from the network where the backend is running.

The API supports checking **multiple servers at the same time** and returns accessibility status, HTTP status code, response time, and error information.

## Features

* Check HTTP/HTTPS URL accessibility
* Check multiple servers in a single API request
* Return HTTP status code
* Return server accessibility status
* Return response time
* Handle invalid URLs
* Handle missing URLs
* 10-second request timeout
* Simple and beginner-friendly API structure
* JSON-based request and response
* Uses `Promise.all()` to check multiple servers simultaneously

## Technologies

* Node.js
* Express.js
* JavaScript
* Fetch API

## Project Structure

```text
bdix-server-checker/
│
├── node_modules/
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Installation

Clone the project or download the source code.

Then install the dependencies:

```bash
npm install
```

## Run the Server

Start the backend server:

```bash
node server.js
```

The server will run on:

```text
http://localhost:5000
```

You should see:

```text
Server is running on port 5000
```

## API Endpoint

### Check Multiple Servers

**Method:**

```text
POST
```

**Endpoint:**

```text
/api/check-servers
```

**Full URL:**

```text
http://localhost:5000/api/check-servers
```

## Request Body

Send a JSON body containing a `servers` array:

```json
{
  "servers": [
    {
      "name": "Google",
      "type": "Internet",
      "url": "https://google.com"
    },
    {
      "name": "BDIX Server",
      "type": "BDIX",
      "url": "http://103.91.144.230/"
    }
  ]
}
```

## Response

A successful response may look like:

```json
{
  "success": true,
  "total": 2,
  "open": 2,
  "failed": 0,
  "servers": [
    {
      "name": "Google",
      "type": "Internet",
      "url": "https://google.com/",
      "accessible": true,
      "status": "open",
      "statusCode": 200,
      "responseTime": 120,
      "message": "Server is accessible"
    },
    {
      "name": "BDIX Server",
      "type": "BDIX",
      "url": "http://103.91.144.230/",
      "accessible": true,
      "status": "open",
      "statusCode": 200,
      "responseTime": 85,
      "message": "Server is accessible"
    }
  ]
}
```

## Response Fields

| Field          | Description                              |
| -------------- | ---------------------------------------- |
| `success`      | API request was processed successfully   |
| `total`        | Total number of servers checked          |
| `open`         | Number of accessible servers             |
| `failed`       | Number of inaccessible servers           |
| `name`         | Server name                              |
| `type`         | Server type                              |
| `url`          | Server URL                               |
| `accessible`   | Whether the server is accessible         |
| `status`       | `open` or `failed`                       |
| `statusCode`   | HTTP response status code                |
| `responseTime` | Response time in milliseconds            |
| `message`      | Result message                           |
| `error`        | Error information when the request fails |

## Error Handling

### Missing Servers Array

If the `servers` array is not provided:

```json
{
  "success": false,
  "message": "Please provide servers array"
}
```

### Invalid URL

If an invalid URL is provided:

```json
{
  "name": "Test Server",
  "type": "BDIX",
  "url": "invalid-url",
  "accessible": false,
  "status": "failed",
  "message": "Invalid URL"
}
```

### Unsupported Protocol

Only `HTTP` and `HTTPS` URLs are currently supported.

For example:

```text
http://example.com
https://example.com
```

Protocols such as:

```text
ftp://
```

are not supported by the current API.

## Important Note

The server accessibility check is performed from the **network where the backend is running**.

For example, if the backend is running on your personal computer and your computer is connected to a specific ISP/network, the API will check the target URL from that network.

If the backend is deployed to a cloud server such as a VPS or hosting platform, the check will be performed from that server's network instead.

Therefore, this API can be useful for checking whether a particular HTTP/HTTPS server is accessible from a specific network.

## Testing with Postman

Use:

```text
POST http://localhost:5000/api/check-servers
```

Set:

```text
Content-Type: application/json
```

Then send:

```json
{
  "servers": [
    {
      "name": "Google",
      "type": "Internet",
      "url": "https://google.com"
    },
    {
      "name": "BDIX Server",
      "type": "BDIX",
      "url": "http://103.91.144.230/"
    }
  ]
}
```

## Future Improvements

Possible future features:

* FTP server checking
* Ping/latency checking
* Port checking
* DNS lookup
* Network/ISP detection
* Server response history
* Frontend dashboard
* Real-time server monitoring
* Server uptime monitoring
* API authentication
* Rate limiting

## License

This project is open-source and can be used for learning and development purposes.