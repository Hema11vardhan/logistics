import { 
  User, InsertUser, 
  LogisticsSpace, InsertLogisticsSpace,
  Shipment, InsertShipment,
  Transaction, InsertTransaction,
  TrackingEvent, InsertTrackingEvent,
  users, logisticsSpaces, shipments, transactions, trackingEvents
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Logistics space operations
  getLogisticsSpace(id: number): Promise<LogisticsSpace | undefined>;
  getLogisticsSpaceByTokenId(tokenId: string): Promise<LogisticsSpace | undefined>;
  getLogisticsSpacesByUserId(userId: number): Promise<LogisticsSpace[]>;
  searchLogisticsSpaces(source: string, destination: string): Promise<LogisticsSpace[]>;
  createLogisticsSpace(space: InsertLogisticsSpace): Promise<LogisticsSpace>;
  updateLogisticsSpaceStatus(id: number, status: string): Promise<LogisticsSpace | undefined>;
  
  // Shipment operations
  getShipment(id: number): Promise<Shipment | undefined>;
  getShipmentsByUserId(userId: number): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipmentStatus(id: number, status: string): Promise<Shipment | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByShipmentId(shipmentId: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string, blockchainTxHash?: string): Promise<Transaction | undefined>;
  
  // Tracking operations
  getTrackingEventsByShipmentId(shipmentId: number): Promise<TrackingEvent[]>;
  createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private logisticsSpaces: Map<number, LogisticsSpace>;
  private shipments: Map<number, Shipment>;
  private transactions: Map<number, Transaction>;
  private trackingEvents: Map<number, TrackingEvent>;
  
  private userIdCounter: number;
  private spaceIdCounter: number;
  private shipmentIdCounter: number;
  private transactionIdCounter: number;
  private trackingEventIdCounter: number;

  constructor() {
    this.users = new Map();
    this.logisticsSpaces = new Map();
    this.shipments = new Map();
    this.transactions = new Map();
    this.trackingEvents = new Map();
    
    this.userIdCounter = 1;
    this.spaceIdCounter = 1;
    this.shipmentIdCounter = 1;
    this.transactionIdCounter = 1;
    this.trackingEventIdCounter = 1;
    
    // Add some initial users for testing
    this.createUser({
      username: "user",
      password: "password",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
      walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    });
    
    this.createUser({
      username: "logistics",
      password: "password",
      email: "logistics@example.com",
      firstName: "Logistics",
      lastName: "Inc",
      role: "logistics",
      walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    });
    
    this.createUser({
      username: "developer",
      password: "password",
      email: "developer@example.com",
      firstName: "Dev",
      lastName: "User",
      role: "developer",
      walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    });
    
    // Add some initial logistics spaces
    this.createLogisticsSpace({
      tokenId: "T-0x8F3E7B4A",
      userId: 2, // logistics user
      source: "New York, NY",
      destination: "Chicago, IL",
      length: 12,
      width: 2.5,
      height: 2.8,
      maxWeight: 24000,
      vehicleType: "18-Wheeler Truck",
      status: "available",
      departureDate: new Date(Date.now() + 86400000), // tomorrow
      price: 1250
    });
    
    this.createLogisticsSpace({
      tokenId: "T-0x7A2D9C1F",
      userId: 2, // logistics user
      source: "Los Angeles, CA",
      destination: "Phoenix, AZ",
      length: 10,
      width: 2.2,
      height: 2.5,
      maxWeight: 18000,
      vehicleType: "Medium Cargo Van",
      status: "partial",
      departureDate: new Date(Date.now() + 86400000), // tomorrow
      price: 980
    });
    
    this.createLogisticsSpace({
      tokenId: "T-0x3F1A6E5D",
      userId: 2, // logistics user
      source: "Seattle, WA",
      destination: "Portland, OR",
      length: 8,
      width: 2.1,
      height: 2.3,
      maxWeight: 14000,
      vehicleType: "Box Truck",
      status: "booked",
      departureDate: new Date(Date.now() + 86400000), // tomorrow
      price: 750
    });
    
    // Create a sample shipment and tracking events for demo purposes
    this.initializeDemoShipment();
  }
  
  // Helper method to create a demo shipment with tracking events
  private async initializeDemoShipment() {
    try {
      // Create a shipment
      const demoShipment = await this.createShipment({
        logisticsSpaceId: 1,
        userId: 1, // Regular user
        goodsType: "Electronics",
        weight: 750,
        length: 2,
        width: 1.5,
        height: 1.8,
        additionalServices: ["insurance", "express"]
      });
      
      // Create a transaction for this shipment
      const demoTransaction = await this.createTransaction({
        shipmentId: demoShipment.id,
        amount: 1380.50,
        currency: "USD",
        paymentMethod: "metamask",
        paymentDetails: { walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" }
      });
      
      // Update transaction status to confirmed
      await this.updateTransactionStatus(
        demoTransaction.id, 
        "confirmed", 
        "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b"
      );
      
      // Update shipment status to confirmed and link transaction
      const updatedShipment = await this.getShipment(demoShipment.id);
      if (updatedShipment) {
        updatedShipment.status = "confirmed";
        updatedShipment.transactionId = demoTransaction.id;
        this.shipments.set(updatedShipment.id, updatedShipment);
      }
      
      // Add some tracking events
      const shipmentId = demoShipment.id;
      const now = new Date();
      
      // Shipment order confirmed event
      await this.createTrackingEvent({
        shipmentId,
        eventType: "order_confirmed",
        timestamp: new Date(now.getTime() - 86400000), // 1 day ago
        location: "New York, NY",
        latitude: 40.7128,
        longitude: -74.0060,
        status: "processing",
        message: "Order has been confirmed",
        details: "Order has been confirmed and payment received."
      });
      
      // Package received event
      await this.createTrackingEvent({
        shipmentId,
        eventType: "package_received",
        timestamp: new Date(now.getTime() - 72000000), // 20 hours ago
        location: "New York Distribution Center, NY",
        latitude: 40.7615,
        longitude: -73.9223,
        status: "processing",
        message: "Package received at distribution center",
        details: "Package has been received at our distribution center."
      });
      
      // In transit event 1
      await this.createTrackingEvent({
        shipmentId,
        eventType: "in_transit",
        timestamp: new Date(now.getTime() - 58000000), // 16 hours ago
        location: "Newark, NJ",
        latitude: 40.7357,
        longitude: -74.1724,
        status: "in transit",
        message: "Departed from Newark",
        details: "Shipment has left the Newark facility and is on the way."
      });
      
      // In transit event 2
      await this.createTrackingEvent({
        shipmentId,
        eventType: "in_transit",
        timestamp: new Date(now.getTime() - 43200000), // 12 hours ago
        location: "Interstate I-80 W, PA",
        latitude: 41.0938,
        longitude: -75.3277,
        status: "in transit",
        message: "In transit on I-80",
        details: "Shipment is in transit to destination."
      });
      
      // Current location
      await this.createTrackingEvent({
        shipmentId,
        eventType: "checkpoint",
        timestamp: new Date(now.getTime() - 21600000), // 6 hours ago
        location: "Cleveland, OH",
        latitude: 41.4993,
        longitude: -81.6944,
        status: "in transit",
        message: "Passed through Cleveland checkpoint",
        details: "Shipment passed through Cleveland checkpoint on time."
      });
      
      // Update shipment status to in_transit
      await this.updateShipmentStatus(shipmentId, "in_transit");
      
      console.log("Demo shipment and tracking events created successfully");
    } catch (error) {
      console.error("Error creating demo shipment:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Logistics space operations
  async getLogisticsSpace(id: number): Promise<LogisticsSpace | undefined> {
    return this.logisticsSpaces.get(id);
  }
  
  async getLogisticsSpaceByTokenId(tokenId: string): Promise<LogisticsSpace | undefined> {
    return Array.from(this.logisticsSpaces.values()).find(
      (space) => space.tokenId === tokenId,
    );
  }
  
  async getLogisticsSpacesByUserId(userId: number): Promise<LogisticsSpace[]> {
    return Array.from(this.logisticsSpaces.values()).filter(
      (space) => space.userId === userId,
    );
  }
  
  async searchLogisticsSpaces(source: string, destination: string): Promise<LogisticsSpace[]> {
    return Array.from(this.logisticsSpaces.values()).filter(
      (space) => 
        space.source.toLowerCase().includes(source.toLowerCase()) && 
        space.destination.toLowerCase().includes(destination.toLowerCase()) &&
        space.status !== "booked"
    );
  }
  
  async createLogisticsSpace(space: InsertLogisticsSpace): Promise<LogisticsSpace> {
    const id = this.spaceIdCounter++;
    const now = new Date();
    const logisticsSpace: LogisticsSpace = { ...space, id, createdAt: now };
    this.logisticsSpaces.set(id, logisticsSpace);
    return logisticsSpace;
  }
  
  async updateLogisticsSpaceStatus(id: number, status: string): Promise<LogisticsSpace | undefined> {
    const space = this.logisticsSpaces.get(id);
    if (space) {
      const updatedSpace = { ...space, status };
      this.logisticsSpaces.set(id, updatedSpace);
      return updatedSpace;
    }
    return undefined;
  }
  
  // Shipment operations
  async getShipment(id: number): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }
  
  async getShipmentsByUserId(userId: number): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(
      (shipment) => shipment.userId === userId,
    );
  }
  
  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const id = this.shipmentIdCounter++;
    const now = new Date();
    const newShipment: Shipment = { 
      ...shipment, 
      id, 
      status: "pending", 
      transactionId: null, 
      createdAt: now 
    };
    this.shipments.set(id, newShipment);
    return newShipment;
  }
  
  async updateShipmentStatus(id: number, status: string): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (shipment) {
      const updatedShipment = { ...shipment, status };
      this.shipments.set(id, updatedShipment);
      return updatedShipment;
    }
    return undefined;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionByShipmentId(shipmentId: number): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (transaction) => transaction.shipmentId === shipmentId,
    );
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      status: "pending", 
      blockchainTxHash: null, 
      createdAt: now 
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async updateTransactionStatus(id: number, status: string, blockchainTxHash?: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updatedTransaction = { 
        ...transaction, 
        status,
        blockchainTxHash: blockchainTxHash || transaction.blockchainTxHash
      };
      this.transactions.set(id, updatedTransaction);
      return updatedTransaction;
    }
    return undefined;
  }
  
  // Tracking operations
  async getTrackingEventsByShipmentId(shipmentId: number): Promise<TrackingEvent[]> {
    return Array.from(this.trackingEvents.values()).filter(
      (event) => event.shipmentId === shipmentId,
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent> {
    const id = this.trackingEventIdCounter++;
    const trackingEvent: TrackingEvent = { ...event, id };
    this.trackingEvents.set(id, trackingEvent);
    return trackingEvent;
  }
}

export const storage = new MemStorage();
