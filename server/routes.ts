import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertLogisticsSpaceSchema, 
  insertShipmentSchema,
  insertTransactionSchema,
  insertTrackingEventSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password, walletAddress } = req.body;
      
      let user;
      
      if (walletAddress) {
        // Login with wallet
        user = await storage.getUserByWalletAddress(walletAddress);
        if (!user) {
          return res.status(401).json({ message: "Invalid wallet address" });
        }
      } else {
        // Login with username/password
        if (!username || !password) {
          return res.status(400).json({ message: "Username and password are required" });
        }
        
        user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
      }
      
      // Simplified authentication (in a real app, we would use JWT or sessions)
      return res.status(200).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletAddress: user.walletAddress
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      if (userData.walletAddress) {
        const existingUserByWallet = await storage.getUserByWalletAddress(userData.walletAddress);
        if (existingUserByWallet) {
          return res.status(400).json({ message: "Wallet address already registered" });
        }
      }
      
      const user = await storage.createUser(userData);
      
      return res.status(201).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletAddress: user.walletAddress
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Logistics Space routes
  app.get("/api/spaces", async (req: Request, res: Response) => {
    try {
      const { source, destination } = req.query;
      
      if (source && destination) {
        const spaces = await storage.searchLogisticsSpaces(source as string, destination as string);
        return res.status(200).json(spaces);
      } else {
        const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
        
        if (userId) {
          const spaces = await storage.getLogisticsSpacesByUserId(userId);
          return res.status(200).json(spaces);
        } else {
          // Return all logistics spaces (for demo purposes)
          const spaces = Array.from(await storage.searchLogisticsSpaces("", ""));
          return res.status(200).json(spaces);
        }
      }
    } catch (error) {
      console.error("Get spaces error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/spaces/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const space = await storage.getLogisticsSpace(id);
      
      if (!space) {
        return res.status(404).json({ message: "Logistics space not found" });
      }
      
      return res.status(200).json(space);
    } catch (error) {
      console.error("Get space error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/spaces", async (req: Request, res: Response) => {
    try {
      const spaceData = insertLogisticsSpaceSchema.parse(req.body);
      
      // Check if token ID already exists
      const existingSpace = await storage.getLogisticsSpaceByTokenId(spaceData.tokenId);
      if (existingSpace) {
        return res.status(400).json({ message: "Token ID already exists" });
      }
      
      const space = await storage.createLogisticsSpace(spaceData);
      return res.status(201).json(space);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create space error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/spaces/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const space = await storage.updateLogisticsSpaceStatus(id, status);
      
      if (!space) {
        return res.status(404).json({ message: "Logistics space not found" });
      }
      
      return res.status(200).json(space);
    } catch (error) {
      console.error("Update space status error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Shipment routes
  app.get("/api/shipments", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const shipments = await storage.getShipmentsByUserId(userId);
      return res.status(200).json(shipments);
    } catch (error) {
      console.error("Get shipments error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/shipments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const shipment = await storage.getShipment(id);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      return res.status(200).json(shipment);
    } catch (error) {
      console.error("Get shipment error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/shipments", async (req: Request, res: Response) => {
    try {
      const shipmentData = insertShipmentSchema.parse(req.body);
      
      // Check if logistics space exists
      const space = await storage.getLogisticsSpace(shipmentData.logisticsSpaceId);
      if (!space) {
        return res.status(400).json({ message: "Logistics space not found" });
      }
      
      // Check if space is available
      if (space.status === "booked") {
        return res.status(400).json({ message: "Logistics space is already booked" });
      }
      
      const shipment = await storage.createShipment(shipmentData);
      
      // Update space status to partial or booked based on logic
      // For simplicity, we'll assume any booking makes the space "booked"
      await storage.updateLogisticsSpaceStatus(shipmentData.logisticsSpaceId, "booked");
      
      return res.status(201).json(shipment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create shipment error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/shipments/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const shipment = await storage.updateShipmentStatus(id, status);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      return res.status(200).json(shipment);
    } catch (error) {
      console.error("Update shipment status error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Transaction routes
  app.get("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      return res.status(200).json(transaction);
    } catch (error) {
      console.error("Get transaction error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/shipments/:shipmentId/transaction", async (req: Request, res: Response) => {
    try {
      const shipmentId = parseInt(req.params.shipmentId);
      const transaction = await storage.getTransactionByShipmentId(shipmentId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found for this shipment" });
      }
      
      return res.status(200).json(transaction);
    } catch (error) {
      console.error("Get transaction by shipment error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Check if shipment exists
      const shipment = await storage.getShipment(transactionData.shipmentId);
      if (!shipment) {
        return res.status(400).json({ message: "Shipment not found" });
      }
      
      // Check if transaction already exists for this shipment
      const existingTransaction = await storage.getTransactionByShipmentId(transactionData.shipmentId);
      if (existingTransaction) {
        return res.status(400).json({ message: "Transaction already exists for this shipment" });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      
      // Update the shipment with the transaction ID
      await storage.updateShipmentStatus(transactionData.shipmentId, "confirmed");
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create transaction error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/transactions/:id/confirm", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { blockchainTxHash } = req.body;
      
      if (!blockchainTxHash) {
        return res.status(400).json({ message: "Blockchain transaction hash is required" });
      }
      
      const transaction = await storage.updateTransactionStatus(id, "completed", blockchainTxHash);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      return res.status(200).json(transaction);
    } catch (error) {
      console.error("Confirm transaction error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Tracking routes
  app.get("/api/shipments/:shipmentId/tracking", async (req: Request, res: Response) => {
    try {
      const shipmentId = parseInt(req.params.shipmentId);
      
      // Check if shipment exists
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      const events = await storage.getTrackingEventsByShipmentId(shipmentId);
      return res.status(200).json(events);
    } catch (error) {
      console.error("Get tracking events error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/tracking", async (req: Request, res: Response) => {
    try {
      const eventData = insertTrackingEventSchema.parse(req.body);
      
      // Check if shipment exists
      const shipment = await storage.getShipment(eventData.shipmentId);
      if (!shipment) {
        return res.status(400).json({ message: "Shipment not found" });
      }
      
      const event = await storage.createTrackingEvent(eventData);
      
      // Update shipment status based on event type
      if (eventData.eventType === "pickup") {
        await storage.updateShipmentStatus(eventData.shipmentId, "in_transit");
      } else if (eventData.eventType === "delivered") {
        await storage.updateShipmentStatus(eventData.shipmentId, "delivered");
      }
      
      return res.status(201).json(event);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create tracking event error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
