-- Query para actualizar los permisos de los roles con solo las rutas existentes
-- Este script actualiza los permisos de los roles para que solo tengan acceso a las rutas que realmente existen

-- Primero, vamos a ver qué roles existen actualmente
SELECT id, nombre, permisos FROM roles;

-- Actualizar permisos para el rol 'admin'
UPDATE roles 
SET permisos = '{
  "dashboard": true,
  "inventory": true,
  "generateReports": true,
  "purchaseOrders": true,
  "verifyRemito": true,
  "productEntry": true,
  "generateQR": true,
  "scanQR": true,
  "adminUsers": true,
  "projects": true,
  "workOrder": true
}' 
WHERE nombre = 'admin';

-- Actualizar permisos para el rol 'usuario' (usuario básico)
UPDATE roles 
SET permisos = '{
  "inventory": true,
  "scanQR": true
}' 
WHERE nombre = 'usuario';

-- Actualizar permisos para el rol 'almacen'
UPDATE roles 
SET permisos = '{
  "dashboard": true,
  "inventory": true,
  "purchaseOrders": true,
  "verifyRemito": true,
  "productEntry": true,
  "generateQR": true,
  "scanQR": true
}' 
WHERE nombre = 'almacen';

-- Actualizar permisos para el rol 'Lider de Proyecto'
UPDATE roles 
SET permisos = '{
  "dashboard": true,
  "inventory": true,
  "generateReports": true,
  "adminUsers": true
}' 
WHERE nombre = 'Lider de Proyecto';

-- Verificar los cambios
SELECT id, nombre, permisos FROM roles ORDER BY nombre;
