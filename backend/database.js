

import { DataSource } from "typeorm";
import config from "./config.js";
import "reflect-metadata";

import User from "./models/User.js";
import Product from "./models/Product.js";
import Role from "./models/Role.js";
import UserRole from "./models/UserRole.js";
import Order from "./models/Order.js";
import Project from "./models/Project.js";
import WorkOrder from "./models/WorkOrder.js";
import WorkOrderItem from "./models/WorkOderItem.js";
import Movements from "./models/Movements.js";
import Receipt from "./models/Receipt.js";
import Warehouse from "./models/Warehouse.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,

  // 🚀 OPTIMIZACIONES:
  synchronize: false, 
  logging: ["error"], 

  // Pool de conexiones (por defecto 10)
  extra: {
    max: 25,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 10000,
  },

  // Cache nativo de TypeORM
  cache: {
    duration: 60000, 
  },

  entities: [
    User,
    Product,
    Role,
    UserRole,
    Order,
    Project,
    WorkOrder,
    WorkOrderItem,
    Movements,
    Receipt,
    Warehouse,
  ],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
