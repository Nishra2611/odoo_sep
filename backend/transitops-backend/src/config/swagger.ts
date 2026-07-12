import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "TransitOps API",
      version: "1.0.0",
      description:
        "Smart Transport Operations Platform API for fleet, drivers, trips, maintenance, expenses, analytics, and AI operations assistant.",
    },

    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local Development Server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "User registration, login, and JWT token management",
      },
      {
        name: "Vehicles",
        description: "Vehicle fleet management operations",
      },
      {
        name: "Drivers",
        description: "Driver management and license compliance tracking",
      },
      {
        name: "Trips",
        description:
          "Trip creation, dispatch validation, completion, and cancellation lifecycle",
      },
      {
        name: "Maintenance",
        description:
          "Vehicle maintenance tracking and availability management",
      },
      {
        name: "Fuel Logs",
        description: "Fuel consumption and cost tracking",
      },
      {
        name: "Expenses",
        description: "Vehicle-related expense management",
      },
      {
        name: "Analytics",
        description:
          "Fleet KPIs, ROI calculations, utilization metrics, and risk analysis",
      },
      {
        name: "AI Assistant",
        description:
          "Natural language fleet operations assistant powered by AI",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter JWT token received from login API",
        },
      },

      schemas: {
        Vehicle: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            regNumber: {
              type: "string",
              example: "GJ01AB1234",
            },
            model: {
              type: "string",
              example: "Tata Truck",
            },
            status: {
              type: "string",
              enum: [
                "AVAILABLE",
                "ON_TRIP",
                "IN_SHOP",
                "RETIRED",
              ],
            },
          },
        },

        Driver: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
              example: "Ramesh Patel",
            },
            licenseNumber: {
              type: "string",
              example: "DL123456",
            },
            status: {
              type: "string",
              enum: [
                "AVAILABLE",
                "ON_TRIP",
                "SUSPENDED",
              ],
            },
          },
        },

        Trip: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            source: {
              type: "string",
              example: "Ahmedabad",
            },
            destination: {
              type: "string",
              example: "Mumbai",
            },
            status: {
              type: "string",
              enum: [
                "DRAFT",
                "DISPATCHED",
                "COMPLETED",
                "CANCELLED",
              ],
            },
          },
        },

        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Vehicle is currently unavailable",
            },
            errorCode: {
              type: "string",
              example: "VEHICLE_NOT_AVAILABLE",
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);