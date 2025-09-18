const { DataSource } = require('typeorm');
const config = require('./config');
require('reflect-metadata');

const User = require('./models/User');
const Product = require('./models/Product');
const Role = require('./models/Role');
const UserRole = require('./models/UserRole');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: true, // Solo para desarrollo
  logging: false,
  entities: [User, Product, Role, UserRole],
  migrations: [],
  subscribers: [],
});

module.exports = AppDataSource;
