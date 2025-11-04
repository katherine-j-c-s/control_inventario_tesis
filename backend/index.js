import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";
import AppDataSource from "./database.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import orderReportRoutes from "./routes/orderReportRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import InventarioSOAPService from "./services/soapService.js";
import projectRoutes from "./routes/projectRoutes.js";
import workOrderRoutes from "./routes/workOrderRoutes.js";
import movementRoutes from "./routes/movementRoutes.js";

// Para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: false,
  })
);

// Middlewares de seguridad básicos
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api", receiptRoutes);
app.use("/api", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-report", orderReportRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", projectRoutes);
app.use("/api", workOrderRoutes);
app.use("/api/movements", movementRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error("Error global:", error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "El archivo es demasiado grande. Máximo 5MB permitido.",
    });
  }

  if (error.message === "Solo se permiten archivos de imagen") {
    return res.status(400).json({ message: error.message });
  }

  res.status(500).json({
    message: "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { error: error.message }),
  });
});

// Inicializar la base de datos y servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await AppDataSource.initialize();
    console.log("Conexión a la base de datos establecida exitosamente");

    // Crear roles por defecto si no existen
    const roleRepository = AppDataSource.getRepository("Role");

    try {
      const adminRole = await roleRepository.findOne({
        where: { nombre: "admin" },
      });
      if (!adminRole) {
        const adminRoleData = roleRepository.create({
          nombre: "admin",
          descripcion: "Administrador del sistema con todos los permisos",
          permisos: {
            dashboard: true,
            inventory: true,
            generateReports: true,
            purchaseOrders: true,
            verifyRemito: true,
            productEntry: true,
            generateQR: true,
            scanQR: true,
            adminUsers: true
          },
          es_sistema: true,
        });
        await roleRepository.save(adminRoleData);
        console.log("Rol de administrador creado");
      } else {
        console.log("Rol de administrador ya existe");
      }

      const userRole = await roleRepository.findOne({
        where: { nombre: "usuario" },
      });
      if (!userRole) {
        const userRoleData = roleRepository.create({
          nombre: "usuario",
          descripcion: "Usuario básico del sistema",
          permisos: {
            inventory: true,
            scanQR: true
          },
          es_sistema: true,
        });
        await roleRepository.save(userRoleData);
        console.log("Rol de usuario creado");
      } else {
        console.log("Rol de usuario ya existe");
      }
    } catch (roleError) {
      console.log("Error al crear roles:", roleError.message);
      // Continuar con la inicialización aunque haya error en roles
    }

    // Crear usuario administrador por defecto si no existe
    const userRepository = AppDataSource.getRepository("User");
    
    try {
      const adminExists = await userRepository.findOne({
        where: [
          { dni: "00000000" },
          { email: "admin@sistema.com" }
        ],
      });

      if (!adminExists) {
        const bcryptModule = await import("bcryptjs");
        const bcrypt = bcryptModule.default;
        const hashedPassword = await bcrypt.hash("admin123", 10);

        const adminUser = userRepository.create({
          nombre: "Administrador",
          apellido: "Sistema",
          dni: "00000000",
          email: "admin@sistema.com",
          puesto_laboral: "Administrador del Sistema",
          edad: 30,
          genero: "No especificado",
          password: hashedPassword,
          rol: "admin",
          permisos: {
            entrega: true,
            movimiento: true,
            egreso: true,
          },
        });

        await userRepository.save(adminUser);
        console.log("Usuario administrador creado:");
        console.log("DNI: 00000000");
        console.log("Contraseña: admin123");
      } else {
        console.log("Usuario administrador ya existe");
      }
    } catch (userError) {
      console.log("Error al crear usuario administrador:", userError.message);
      // Continuar con la inicialización aunque haya error en usuario
    }

    // Configurar servicio SOAP
    const soapService = new InventarioSOAPService();
    soapService.configureSOAPService(app);
    console.log("🔧 Servicio SOAP de inventario configurado");

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`Servidor ejecutándose en puerto ${config.port}`);
      console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 API REST disponible en: http://localhost:${config.port}/api`);
      console.log(`🔧 Servicio SOAP disponible en: http://localhost:${config.port}/soap/inventario`);
    });
  } catch (error) {
    console.error("❌ Error al inicializar el servidor:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Posibles soluciones:");
      console.log("   1. Verificar que PostgreSQL esté ejecutándose");
      console.log("   2. Verificar que el puerto 5432 esté disponible");
      console.log("   3. Verificar la configuración en el archivo .env");
    } else if (error.code === "3D000") {
      console.log('\n💡 La base de datos "controlInventario" no existe.');
      console.log("   Ejecuta el script create_database.sql en pgAdmin4");
    } else if (error.code === "28P01") {
      console.log("\n💡 Error de autenticación.");
      console.log("   Verifica el usuario y contraseña en el archivo .env");
    }

    process.exit(1);
  }
};

startServer();
