#!/usr/bin/env node

/**
 * API Documentation Server
 * 
 * This script starts a standalone documentation server for viewing the OpenAPI docs
 * without running the full application.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.DOCS_PORT || 8080;

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'docs')));

// Serve the OpenAPI spec
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi.yaml'));
});

// ReDoc documentation page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>IT Youth Talent Incubator API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <redoc spec-url='/openapi.yaml'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
  `);
});

// Swagger UI documentation page
app.get('/swagger', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>IT Youth Talent Incubator API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@latest/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-bundle.js" crossorigin></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: '/openapi.yaml',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: "BaseLayout"
    });
  };
</script>
</body>
</html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Documentation server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('📚 IT Youth Talent Incubator API Documentation Server');
  console.log('='.repeat(70));
  console.log(`\n✅ Server is running on port ${PORT}\n`);
  console.log('📖 Documentation URLs:');
  console.log(`   - ReDoc UI:    http://localhost:${PORT}`);
  console.log(`   - Swagger UI:  http://localhost:${PORT}/swagger`);
  console.log(`   - OpenAPI Spec: http://localhost:${PORT}/openapi.yaml`);
  console.log('\n' + '='.repeat(70) + '\n');
  console.log('Press Ctrl+C to stop the server\n');
});
