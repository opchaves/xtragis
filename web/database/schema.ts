import {
  geometry,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const guestBook = pgTable("guestBook", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const stores = pgTable(
  "stores",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    location: geometry("location", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
  },
  (t) => [index("spatial_index").using("gist", t.location)],
);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const activities = pgTable(
  "activities",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    type: text("type").notNull(), // e.g., 'ride', 'run'
    distance: real("distance"), // meters
    moving_time: integer("moving_time"), // seconds
    elapsed_time: integer("elapsed_time"), // seconds
    total_elevation_gain: real("total_elevation_gain"), // meters
    start_date: timestamp("start_date").notNull(),
    description: text("description"),
    origin: geometry("origin", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
    origin_city: text("origin_city"), // reverse geocoded city name
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index("activities_origin_idx").using("gist", t.origin)],
);

export const activityPoints = pgTable(
  "activity_points",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    activity_id: integer("activity_id")
      .notNull()
      .references(() => activities.id),
    latlng: geometry("latlng", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
    elevation: real("elevation"),
    altitude: real("altitude"),
    timestamp: timestamp("timestamp").notNull(),
    sequence: integer("sequence").notNull(), // order of the point in the activity
  },
  (t) => [index("activity_points_latlng_idx").using("gist", t.latlng)],
);
