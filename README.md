
# 📦 Sistema de Control de Inventario  

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)  
![Node.js](https://img.shields.io/badge/Node.js-18-green?style=flat-square&logo=node.js)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)  
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)  

Un sistema web para **gestionar productos, usuarios y roles** dentro de un inventario.  
Diseñado con **Next.js (App Router)** en el frontend y **PostgreSQL** en la base de datos.  

---

## ✨ Características principales
- ✅ Registro y login de usuarios con autenticación 🔐  
- ✅ Panel de administración con distintos roles (admin, usuario)  
- ✅ Gestión de productos (crear, editar, eliminar, listar)  
- ✅ Control de stock en tiempo real 📊  
- ✅ Interfaz moderna con **TailwindCSS**  
- ✅ Backend conectado a **PostgreSQL**  

---

## 🚀 Tecnologías usadas
- **Frontend:** Next.js, React, TailwindCSS  
- **Backend:** Node.js, Express  
- **Base de datos:** PostgreSQL  


---

## 📂 Estructura del proyecto
```bash
control_inventario_tesis/
│── backend/          # API con Node.js + Express
│── frontend/         # Next.js + Tailwind
│   ├── src/app/      # Páginas con App Router
│   ├── components/   # Componentes reutilizables
│   ├── hooks/        # Hooks personalizados (useAuth, etc.)
│── README.md
````

---

## ⚡ Instalación y uso

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/katherine-j-c-s/control_inventario_tesis.git
   cd control_inventario_tesis
   ```

2. **Instalar dependencias (frontend y backend)**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configurar variables de entorno**

   * En `backend/.env`:

     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=postgres
     DB_PASS=tu_password
     DB_NAME=controlInventario
     JWT_SECRET=tu_secreto
     ```

4. **Levantar el backend**

   ```bash
   cd backend
   npm run dev
   ```

5. **Levantar el frontend**

   ```bash
   cd frontend
   npm run dev
   ```

---



## 👩‍💻 Autoras

**Gabriela Contreras**
💼 Desarrolladora Web 

📧 \[gabriela.contreras@est.fi.uncoma.edu.ar]

---
**Katherine Contreras**
💼 Desarrolladora Web 

📧 \[katherine.contreras@est.fi.uncoma.edu.ar]

---
## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.
¡Sentite libre de usarlo, mejorarlo y compartirlo! 🚀



escanner
## 🔧 Dependencias

- `qr-scanner`: Librería principal para escaneo
- `lucide-react`: Iconos
- `@/components/ui/*`: Componentes UI base