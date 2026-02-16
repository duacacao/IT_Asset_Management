import { pgTable, text, timestamp, boolean, jsonb, serial, uuid } from "drizzle-orm/pg-core";

// ⚠️ Note: auth.users is managed by Supabase, we create a public.profiles table to link extras
export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("user_id").notNull(), // Links to auth.users.id
    email: text("email").notNull(),
    role: text("role").default("user"), // 'admin' | 'user'
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    code: text("code").unique(), // Asset Code (e.g. LAP-001)
    name: text("name").notNull(),
    type: text("type").notNull(), // Laptop, PC, Monitor...
    status: text("status").notNull().default("active"),
    specs: jsonb("specs").default({}), // Flexible JSON for varied hardware specs
    ownerId: uuid("owner_id").references(() => profiles.id), // Assigned to user
    location: text("location"),
    purchaseDate: timestamp("purchase_date", { withTimezone: true }),
    warrantyExp: timestamp("warranty_exp", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Bảng theo dõi lịch sử gán thiết bị cho end-user
// Quan hệ 1:1 tại bất kỳ thời điểm nào (enforced bởi partial unique index trong DB)
export const deviceAssignments = pgTable("device_assignments", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
    endUserId: uuid("end_user_id").notNull(), // References end_users.id
    userId: uuid("user_id").notNull(), // References auth.users.id — dùng cho RLS
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    returnedAt: timestamp("returned_at", { withTimezone: true }), // NULL = đang active
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const logs = pgTable("activity_logs", {
    id: serial("id").primaryKey(),
    deviceId: uuid("device_id").references(() => devices.id),
    userId: uuid("user_id").references(() => profiles.id),
    action: text("action").notNull(), // 'create', 'update', 'delete', 'assign'
    details: text("details"),
    timestamp: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
