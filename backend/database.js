import { DataSource } from 'typeorm';
import config from './config.js';
import 'reflect-metadata';

import User from './models/User.js';
import Product from './models/Product.js';
import Role from './models/Role.js';
import UserRole from './models/UserRole.js';

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

export default AppDataSource;
