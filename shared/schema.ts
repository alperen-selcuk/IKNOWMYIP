import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Custom validation schemas
export const portScanSchema = z.object({
  ipAddress: z.string().min(1),
  port: z.number().int().min(1).max(65535),
});

export const dnsResolveSchema = z.object({
  domain: z.string().min(1),
  dnsServer: z.string().nullable().optional(),
});

// DNS record lookup schema
export const dnsLookups = pgTable("dns_lookups", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  recordType: text("record_type").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertDnsLookupSchema = createInsertSchema(dnsLookups).pick({
  domain: true,
  recordType: true,
  timestamp: true,
});

export type InsertDnsLookup = z.infer<typeof insertDnsLookupSchema>;
export type DnsLookup = typeof dnsLookups.$inferSelect;

// Define IP information schema
export const ipInfo = pgTable("ip_info", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  timestamp: text("timestamp").notNull(),
  userAgent: text("user_agent").notNull(),
});

export const insertIpInfoSchema = createInsertSchema(ipInfo).pick({
  ipAddress: true,
  timestamp: true,
  userAgent: true,
});

export type InsertIpInfo = z.infer<typeof insertIpInfoSchema>;
export type IpInfo = typeof ipInfo.$inferSelect;

// Maintaining the users table as it was previously defined
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
