// require('dotenv').config();

// const path = require('path');
// const { DataSource } = require('typeorm');

// const dataSource = new DataSource({
//   type: 'postgres',
//   url: process.env.DATABASE_HOST ,
//   // port: parseInt(process.env.DATABASE_PORT || '5432', 10),
//   // username: process.env.DATABASE_USER || 'postgres',
//   // password: process.env.DATABASE_PASSWORD || 'postgres',
//   // database: process.env.DATABASE_NAME || 'gym_tracker',
//   entities: [path.join(__dirname, '../entities/*.js')],
//   migrations: [path.join(__dirname, '../migrations/*.js')],
//   synchronize: false,
//   logging: false,
// });

// module.exports = dataSource;


require('dotenv').config();

const path = require('path');
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',

  // ✅ IMPORTANT: only full connection URL use karo
  url: process.env.DATABASE_URL,

  // Entities & migrations
  entities: [path.join(__dirname, '../entities/*.js')],
  migrations: [path.join(__dirname, '../migrations/*.js')],

  // Production safe settings
  synchronize: false,
  logging: false,

  // ✅ Required for Neon / Render PostgreSQL
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = dataSource;