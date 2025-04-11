import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const replicationRequests = pgTable("replication_requests", {
  id: serial("id").primaryKey(),
  account: text("account").notNull(),
  pureProxyAccount: text("pure_proxy_account").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReplicationRequestSchema = createInsertSchema(replicationRequests).pick({
  account: true,
  pureProxyAccount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReplicationRequest = z.infer<typeof insertReplicationRequestSchema>;
export type ReplicationRequest = typeof replicationRequests.$inferSelect;
