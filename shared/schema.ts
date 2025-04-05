import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USER RELATED SCHEMAS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // user, logistics, developer
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  walletAddress: true,
});

// LOGISTICS SPACE SCHEMAS
export const logisticsSpaces = pgTable("logistics_spaces", {
  id: serial("id").primaryKey(),
  tokenId: text("token_id").notNull().unique(), // blockchain token ID
  userId: integer("user_id").notNull(), // logistics company user ID
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  length: real("length").notNull(), // in meters
  width: real("width").notNull(), // in meters
  height: real("height").notNull(), // in meters
  maxWeight: real("max_weight").notNull(), // in kg
  vehicleType: text("vehicle_type").notNull(),
  status: text("status").notNull().default("available"), // available, partial, booked
  departureDate: timestamp("departure_date"),
  price: real("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLogisticsSpaceSchema = createInsertSchema(logisticsSpaces)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    // Ensure departureDate can be either a Date object or an ISO string
    departureDate: z.string().or(z.date()).transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }),
  });

// SHIPMENT SCHEMAS
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  logisticsSpaceId: integer("logistics_space_id").notNull(),
  userId: integer("user_id").notNull(),
  goodsType: text("goods_type").notNull(),
  weight: real("weight").notNull(), // in kg
  length: real("length").notNull(), // in meters
  width: real("width").notNull(), // in meters
  height: real("height").notNull(), // in meters
  status: text("status").notNull().default("pending"), // pending, confirmed, in_transit, delivered
  additionalServices: jsonb("additional_services"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  status: true,
  transactionId: true,
  createdAt: true,
});

// TRANSACTION SCHEMAS
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentMethod: text("payment_method").notNull(), // metamask, upi, card
  paymentDetails: jsonb("payment_details"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  blockchainTxHash: text("blockchain_tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  status: true,
  blockchainTxHash: true,
  createdAt: true,
});

// TRACKING SCHEMAS
export const trackingEvents = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull(),
  eventType: text("event_type").notNull(), // pickup, in_transit, delivered, etc.
  location: text("location"),
  latitude: real("latitude").default(0),
  longitude: real("longitude").default(0),
  status: text("status").default("update"),
  message: text("message"),
  timestamp: timestamp("timestamp").defaultNow(),
  details: text("details"),
});

export const insertTrackingEventSchema = createInsertSchema(trackingEvents).omit({
  id: true,
}).extend({
  // Allow timestamp to be either a Date object or an ISO string
  timestamp: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

// TYPE EXPORTS
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LogisticsSpace = typeof logisticsSpaces.$inferSelect;
export type InsertLogisticsSpace = z.infer<typeof insertLogisticsSpaceSchema>;

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = z.infer<typeof insertTrackingEventSchema>;
