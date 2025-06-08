require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRES_USER || 'tracking_user',
    password: process.env.POSTGRES_PASSWORD || 'tracking_password',
    database: process.env.POSTGRES_DB || 'tracking_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  test: {
    username: process.env.POSTGRES_USER || 'tracking_user',
    password: process.env.POSTGRES_PASSWORD || 'tracking_password',
    database: process.env.POSTGRES_DB + '_test' || 'tracking_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
};
