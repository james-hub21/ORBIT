import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["student", "faculty", "admin"]);

// User status enum
export const userStatusEnum = pgEnum("user_status", ["active", "banned", "suspended"]);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("student").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Computer stations
export const computerStations = pgTable("computer_stations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  location: varchar("location").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ORZ computer sessions
export const orzSessions = pgTable("orz_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stationId: integer("station_id").references(() => computerStations.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  plannedEndTime: timestamp("planned_end_time").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Time extension requests
export const timeExtensionRequests = pgTable("time_extension_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => orzSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  requestedMinutes: integer("requested_minutes").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, approved, denied
  adminId: varchar("admin_id").references(() => users.id),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Facilities
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  capacity: integer("capacity").notNull(),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Facility bookings
export const facilityBookings = pgTable("facility_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  facilityId: integer("facility_id").references(() => facilities.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  purpose: text("purpose").notNull(),
  participants: integer("participants").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, approved, denied, cancelled
  adminId: varchar("admin_id").references(() => users.id),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System alerts
export const systemAlerts = pgTable("system_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type").notNull(), // security, system, user
  severity: varchar("severity").notNull(), // low, medium, high, critical
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  userId: varchar("user_id").references(() => users.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orzSessions: many(orzSessions),
  facilityBookings: many(facilityBookings),
  timeExtensionRequests: many(timeExtensionRequests),
  systemAlerts: many(systemAlerts),
  activityLogs: many(activityLogs),
}));

export const computerStationsRelations = relations(computerStations, ({ many }) => ({
  orzSessions: many(orzSessions),
}));

export const orzSessionsRelations = relations(orzSessions, ({ one, many }) => ({
  user: one(users, { fields: [orzSessions.userId], references: [users.id] }),
  station: one(computerStations, { fields: [orzSessions.stationId], references: [computerStations.id] }),
  timeExtensionRequests: many(timeExtensionRequests),
}));

export const timeExtensionRequestsRelations = relations(timeExtensionRequests, ({ one }) => ({
  session: one(orzSessions, { fields: [timeExtensionRequests.sessionId], references: [orzSessions.id] }),
  user: one(users, { fields: [timeExtensionRequests.userId], references: [users.id] }),
  admin: one(users, { fields: [timeExtensionRequests.adminId], references: [users.id] }),
}));

export const facilitiesRelations = relations(facilities, ({ many }) => ({
  bookings: many(facilityBookings),
}));

export const facilityBookingsRelations = relations(facilityBookings, ({ one }) => ({
  facility: one(facilities, { fields: [facilityBookings.facilityId], references: [facilities.id] }),
  user: one(users, { fields: [facilityBookings.userId], references: [users.id] }),
  admin: one(users, { fields: [facilityBookings.adminId], references: [users.id] }),
}));

export const systemAlertsRelations = relations(systemAlerts, ({ one }) => ({
  user: one(users, { fields: [systemAlerts.userId], references: [users.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertOrzSessionSchema = createInsertSchema(orzSessions).omit({
  id: true,
  createdAt: true,
});

export const insertTimeExtensionRequestSchema = createInsertSchema(timeExtensionRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacilityBookingSchema = createInsertSchema(facilityBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertOrzSession = z.infer<typeof insertOrzSessionSchema>;
export type OrzSession = typeof orzSessions.$inferSelect;
export type InsertTimeExtensionRequest = z.infer<typeof insertTimeExtensionRequestSchema>;
export type TimeExtensionRequest = typeof timeExtensionRequests.$inferSelect;
export type InsertFacilityBooking = z.infer<typeof insertFacilityBookingSchema>;
export type FacilityBooking = typeof facilityBookings.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type ComputerStation = typeof computerStations.$inferSelect;
export type SystemAlert = typeof systemAlerts.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
