import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReplicationRequestSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for handling replication requests
  app.post("/api/replicate", async (req, res) => {
    try {
      // Validate the request body using the schema
      const validatedData = insertReplicationRequestSchema.parse(req.body);
      
      // Process the replication request
      const result = await storage.createReplicationRequest(validatedData);
      
      // Return success response
      return res.status(200).json({
        success: true,
        data: result,
        message: "Replication request submitted successfully"
      });
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: error.errors
        });
      }
      
      // Handle other errors
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
