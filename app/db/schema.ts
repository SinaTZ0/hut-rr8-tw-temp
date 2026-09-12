import { sql } from "drizzle-orm";

import {
  bigint,
  check,
  date,
  index,
  inet,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const feedbackTypeEnum = pgEnum("feedback_type", ["complaint", "suggestion"]);
export const consultationGenderEnum = pgEnum("consultation_gender", ["unknown", "male", "female"]);
export const consultationMaritalStatusEnum = pgEnum("consultation_marital_status", ["unknown", "single", "married"]);
export const consultationFacultyEnum = pgEnum("consultation_faculty", [
  "unknown",
  "electrical-computer",
  "technical-engineering",
  "basic-sciences",
]);
export const consultationMajorEnum = pgEnum("consultation_major", [
  "unknown",
  "computer",
  "electrical",
  "industrial",
  "polymer",
  "civil",
  "mechanical",
  "engineering-physics",
  "organic-chemistry",
]);

export const complaintSubmissions = pgTable(
  "complaint_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackingCode: varchar("tracking_code", { length: 32 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }),
    mobile: varchar("mobile", { length: 20 }),
    email: varchar("email", { length: 320 }),
    studentId: varchar("student_id", { length: 40 }),
    department: varchar("department", { length: 180 }).notNull(),
    feedbackType: feedbackTypeEnum("feedback_type").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    trackingCodeUnique: uniqueIndex("complaint_submissions_tracking_code_unique").on(table.trackingCode),
    createdAtIndex: index("complaint_submissions_created_at_idx").on(table.createdAt),
  }),
);

export type ComplaintSubmissionInsert = typeof complaintSubmissions.$inferInsert;

export const consultationSubmissions = pgTable(
  "consultation_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackingCode: varchar("tracking_code", { length: 32 }).notNull(),
    gender: consultationGenderEnum("gender").notNull(),
    age: integer("age").notNull(),
    maritalStatus: consultationMaritalStatusEnum("marital_status").notNull(),
    email: varchar("email", { length: 320 }),
    mobile: varchar("mobile", { length: 20 }),
    faculty: consultationFacultyEnum("faculty").notNull(),
    major: consultationMajorEnum("major").notNull(),
    question: text("question").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    trackingCodeUnique: uniqueIndex("consultation_submissions_tracking_code_unique").on(table.trackingCode),
    createdAtIndex: index("consultation_submissions_created_at_idx").on(table.createdAt),
  }),
);

export type ConsultationSubmissionInsert = typeof consultationSubmissions.$inferInsert;

export const websiteStats = pgTable("website_stats", {
  id: integer("id").primaryKey(),
  statsDate: date("stats_date", { mode: "string" }).notNull(),
  todayVisitCount: bigint("today_visit_count", { mode: "number" }).notNull().default(0),
  todayUserCount: bigint("today_user_count", { mode: "number" }).notNull().default(0),
  totalVisitCount: bigint("total_visit_count", { mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  singletonIdCheck: check("website_stats_singleton_id_check", sql`${table.id} = 1`),
}));

export const websiteDailyUsers = pgTable("website_daily_users", {
  ipAddress: inet("ip_address").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
