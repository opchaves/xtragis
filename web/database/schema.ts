import { geometry, index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const guestBook = pgTable("guestBook", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const stores = pgTable(
  'stores',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  },
  (t) => [
    index('spatial_index').using('gist', t.location),
  ]
);
