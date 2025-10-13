import {
  pgEnum,
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* Enums */
export const briefSourceEnum = pgEnum("brief_source", ["manual", "bot"]);
export const briefStateEnum = pgEnum("brief_state", [
  "collecting",
  "ready_for_outline",
  "outline_ready",
  "outcomes_ready",
  "committed",
  "abandoned",
]);
export const learnerLevelEnum = pgEnum("learner_level", [
  "novice",
  "intermediate",
  "advanced",
]);
export const targetDifficultyEnum = pgEnum("target_difficulty", [
  "easy",
  "standard",
  "rigorous",
  "expert",
]);
export const eventActorEnum = pgEnum("event_actor", ["user", "bot"]);
export const eventTypeEnum = pgEnum("event_type", [
  "q",
  "a",
  "gen_prereqs",
  "approve_prereqs",
  "gen_outline",
  "approve_outline",
  "gen_outcomes",
  "approve_outcomes",
  "commit",
]);

export const courseBriefs = pgTable(
  "course_briefs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: text("owner_user_id").notNull(),
    source: briefSourceEnum("source").notNull(),
    modeState: briefStateEnum("mode_state").notNull().default("collecting"),
    topic: text("topic"),
    details: text("details"),
    learnerLevel: learnerLevelEnum("learner_level"),
    targetDifficulty: targetDifficultyEnum("target_difficulty"),
    goals: jsonb("goals"),
    prereqSuggestions: jsonb("prereq_suggestions"),
    planOutline: jsonb("plan_outline"),
    planOutcomes: jsonb("plan_outcomes"),
    modelMetadata: jsonb("model_metadata"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

    committedCourseId: uuid("committed_course_id")
      .references(() => courses.id, { onDelete: "set null" }),
  },
  (t) => ({
    byOwnerState: uniqueIndex("idx_course_briefs_owner_state").on(t.ownerUserId, t.modeState),
    uniqCommitted: uniqueIndex("uniq_course_briefs_committed_course_id").on(t.committedCourseId),
  })
);

export const briefEvents = pgTable("brief_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id")
    .references(() => courseBriefs.id, { onDelete: "cascade" })
    .notNull(),
  actor: eventActorEnum("actor").notNull(),
  type: eventTypeEnum("type").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const visibilityEnum = pgEnum("visibility", ["private", "unlisted", "public"]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: text("owner_user_id").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    status: courseStatusEnum("status").notNull().default("draft"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

    briefId: uuid("brief_id")
      .references(() => courseBriefs.id, { onDelete: "set null" }),
  },
  (t) => ({
    uniqSlug: uniqueIndex("uniq_courses_slug").on(t.slug),
    uniqBriefId: uniqueIndex("uniq_courses_brief_id").on(t.briefId), 
  })
);


export const courseBriefsRelations = relations(courseBriefs, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseBriefs.committedCourseId],
    references: [courses.id],
  }),
  events: many(briefEvents),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  brief: one(courseBriefs, {
    fields: [courses.briefId],
    references: [courseBriefs.id],
  }),
}));
