export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "FirstDay AI Simulation Engine API",
    version: "1.0.0",
    description: "API for managing tasks and evaluating user solutions via Gemini AI",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local server",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Check server health",
        responses: {
          "200": {
            description: "Server is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string", example: "Backend is running" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/tasks": {
      post: {
        summary: "Create a new task",
        description: "Upload starter and solution ZIP files to create a new task. The server will compute the diff.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "React Setup Task" },
                  description: { type: "string", example: "Initialize a React project" },
                  evaluationCriteria: { 
                    type: "string", 
                    example: "[\"Must use Vite\", \"Must install Tailwind\"]",
                    description: "JSON array of strings"
                  },
                  starter: {
                    type: "string",
                    format: "binary",
                    description: "ZIP file containing the starter code",
                  },
                  solution: {
                    type: "string",
                    format: "binary",
                    description: "ZIP file containing the solution code",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created successfully",
          },
        },
      },
    },
    "/tasks/{id}": {
      get: {
        summary: "Get task details",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Task details",
          },
        },
      },
    },
    "/tasks/{id}/submit": {
      post: {
        summary: "Submit user solution",
        description: "Upload user's ZIP file to evaluate against the task solution using AI.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  userId: { type: "string", example: "user-123" },
                  userSolution: {
                    type: "string",
                    format: "binary",
                    description: "ZIP file containing the user's solution",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Evaluation results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    submissionId: { type: "string" },
                    evaluation: {
                      type: "object",
                      properties: {
                        score: { type: "number" },
                        logic: { type: "number" },
                        correctness: { type: "number" },
                        completeness: { type: "number" },
                        feedback: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
