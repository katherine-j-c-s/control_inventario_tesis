import { DataSource } from 'typeorm';
import config from './config.js';
import 'reflect-metadata';

import User from './models/User.js';
import Product from './models/Product.js';
import Role from './models/Role.js';
import UserRole from './models/UserRole.js';
import Order from './models/Order.js';
import Project from './models/Project.js';
import WorkOrder from './models/WorkOrder.js';
import WorkOrderItem from './models/WorkOderItem.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: true,
  logging: false,
  entities: [User, Product, Role, UserRole, Order, Project, WorkOrder, WorkOrderItem],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
