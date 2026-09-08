import {sqliteTable,text,primaryKey,uniqueIndex} from 'drizzle-orm/sqlite-core';
// JSON entities retain the same data shape in the required local JSON Server and hosted D1.
export const records=sqliteTable('records',{
  collection:text('collection').notNull(),
  id:text('id').notNull(),
  data:text('data').notNull(),
  email:text('email'),
  nickname:text('nickname'),
},table=>[
  primaryKey({columns:[table.collection,table.id]}),
  uniqueIndex('unique_user_email').on(table.email),
  uniqueIndex('unique_user_nickname').on(table.nickname),
]);
