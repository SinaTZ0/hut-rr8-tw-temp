import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const feedbackTypeEnum = pgEnum("feedback_type", ["complaint", "suggestion"]);

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
