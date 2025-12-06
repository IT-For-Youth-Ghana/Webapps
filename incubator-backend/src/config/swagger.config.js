/* eslint-disable no-undef */
/**
 * Swagger/OpenAPI Configuration
 * Sets up API documentation using Swagger UI and ReDoc
 */

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Get current directory (ES6 module compatibility)
const __dirname = path.dirname(__filename);

// Load OpenAPI specification
const openapiDocument = YAML.load(
  path.join(__dirname, "../../openapi.yaml")
);

/**
 * Swagger UI Options
 * Customizes the appearance and behavior of Swagger UI
 */
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { 
      background: #fafafa; 
      box-shadow: none; 
      padding: 20px;
      border-radius: 4px;
    }
    .swagger-ui .info .title {
      color: #3b4151;
      font-size: 36px;
    }
  `,
  customSiteTitle: "IT Youth Talent Incubator API Docs",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    syntaxHighlight: {
      activate: true,
      theme: "monokai",
    },
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
  },
};

/**
 * ReDoc Options
 * Customizes the appearance of ReDoc documentation
 */
const redocOptions = {
  title: "IT Youth Talent Incubator API Documentation",
  specUrl: "/api-docs/openapi.yaml",
  nonce: "", // Optional: CSP nonce
  // ReDoc options
  redocOptions: {
    theme: {
      colors: {
        primary: {
          main: "#3b82f6",
        },
      },
      typography: {
        fontSize: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        headings: {
          fontFamily: "system-ui, -apple-system, sans-serif",
        },
      },
    },
    hideDownloadButton: false,
    expandResponses: "200,201",
    jsonSampleExpandLevel: 2,
    hideSingleRequestSampleTab: true,
    menuToggle: true,
    nativeScrollbars: false,
    sortPropsAlphabetically: true,
    sortTagsAlphabetically: true,
    sortEnumValuesAlphabetically: true,
    pathInMiddlePanel: true,
    requiredPropsFirst: true,
    scrollYOffset: 50,
    showExtensions: true,
    hideHostname: false,
    hideLoading: false,
    expandDefaultServerVariables: true,
    maxDisplayedEnumValues: 10,
  },
};

/**
 * Setup API documentation routes
 * @param {Express.Application} app - Express application instance
 */
const setupAPIDocs = (app) => {
  // Serve OpenAPI YAML file
  app.get("/api-docs/openapi.yaml", (req, res) => {
    res.type("text/yaml");
    res.sendFile(path.join(__dirname, "../../openapi.yaml"));
  });

  // Serve OpenAPI JSON format
  app.get("/api-docs/openapi.json", (req, res) => {
    res.json(openapiDocument);
  });

  // Swagger UI documentation (interactive API explorer)
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, swaggerUiOptions)
  );

  // ReDoc documentation (beautiful, responsive API docs)
  app.get("/api-docs/redoc", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${redocOptions.title}</title>
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
          <redoc spec-url='${redocOptions.specUrl}'></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
      </html>
    `);
  });

  // API documentation landing page
  app.get("/docs", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IT Youth Talent Incubator - API Documentation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 900px;
            width: 100%;
            padding: 60px 40px;
            text-align: center;
          }
          h1 {
            font-size: 42px;
            color: #1a202c;
            margin-bottom: 16px;
            font-weight: 700;
          }
          .subtitle {
            font-size: 18px;
            color: #718096;
            margin-bottom: 48px;
          }
          .version {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 32px;
          }
          .docs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            margin-top: 40px;
          }
          .doc-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 32px 24px;
            border-radius: 12px;
            text-decoration: none;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .doc-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          }
          .doc-card h3 {
            font-size: 24px;
            margin-bottom: 12px;
            font-weight: 600;
          }
          .doc-card p {
            font-size: 14px;
            opacity: 0.95;
            line-height: 1.6;
          }
          .doc-card.swagger {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          }
          .doc-card.openapi {
            background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
          }
          .features {
            margin-top: 48px;
            padding-top: 48px;
            border-top: 2px solid #e2e8f0;
          }
          .features h2 {
            font-size: 28px;
            color: #1a202c;
            margin-bottom: 24px;
          }
          .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            text-align: left;
          }
          .feature-item {
            padding: 16px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .feature-item strong {
            color: #2d3748;
            display: block;
            margin-bottom: 4px;
          }
          .feature-item span {
            color: #718096;
            font-size: 14px;
          }
          .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="version">v1.0.0</span>
          <h1>🚀 IT Youth Talent Incubator API</h1>
          <p class="subtitle">
            Comprehensive API documentation for connecting IT talent with opportunities in Ghana
          </p>
          
          <div class="docs-grid">
            <a href="/api-docs" class="doc-card">
              <h3>📘 Swagger UI</h3>
              <p>Interactive API explorer with try-it-out functionality. Perfect for testing endpoints.</p>
            </a>
            
            <a href="/api-docs/redoc" class="doc-card swagger">
              <h3>📗 ReDoc</h3>
              <p>Beautiful, responsive API documentation. Great for reading and understanding the API.</p>
            </a>
            
            <a href="/api-docs/openapi.yaml" class="doc-card openapi" download>
              <h3>📄 OpenAPI Spec</h3>
              <p>Download the OpenAPI 3.0 specification file (YAML format).</p>
            </a>
          </div>

          <div class="features">
            <h2>API Features</h2>
            <div class="feature-list">
              <div class="feature-item">
                <strong>🔐 Authentication</strong>
                <span>JWT-based secure authentication</span>
              </div>
              <div class="feature-item">
                <strong>👥 User Management</strong>
                <span>Students, Companies & Admins</span>
              </div>
              <div class="feature-item">
                <strong>💼 Job Management</strong>
                <span>Full CRUD operations for jobs</span>
              </div>
              <div class="feature-item">
                <strong>📊 Analytics</strong>
                <span>Comprehensive job analytics</span>
              </div>
              <div class="feature-item">
                <strong>🔍 Search & Filter</strong>
                <span>Advanced search capabilities</span>
              </div>
              <div class="feature-item">
                <strong>📄 Applications</strong>
                <span>Job application tracking</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Need help? Contact <strong>support@itfy-incubator.com</strong></p>
            <p style="margin-top: 8px;">Base URL: <code>${process.env.API_BASE_URL || "http://localhost:3001/api"}</code></p>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  console.log("API Documentation routes configured:");
  console.log("   Swagger UI:    /api-docs");
  console.log("   ReDoc:         /api-docs/redoc");
  console.log("   OpenAPI YAML:  /api-docs/openapi.yaml");
  console.log("   OpenAPI JSON:  /api-docs/openapi.json");
  console.log("   Docs Home:     /docs");
};

module.exports = {
  setupAPIDocs,
  openapiDocument,
  swaggerUiOptions,
  redocOptions,
};