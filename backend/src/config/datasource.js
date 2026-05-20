require('dotenv').config();

const path = require('path');
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_HOST || '127.0.0.1',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'gym_tracker',
  entities: [path.join(__dirname, '../entities/*.js')],
  migrations: [path.join(__dirname, '../migrations/*.js')],
  synchronize: false,
  logging: false,
});

module.exports = dataSource;
