import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 5001,
  jwtSecret: process.env.JWT_SECRET || 'tu_secreto_jwt_muy_seguro_aqui',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'MiClave123',
    database: process.env.DB_NAME || 'controlInventario',
  }
};
