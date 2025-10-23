-- Actualizar permisos del usuario admin para incluir todas las rutas
UPDATE users 
SET permisos = '{
  "dashboard": true,
  "inventory": true,
  "purchaseOrders": true,
  "verifyRemito": true,
  "productEntry": true,
  "productExit": true,
  "generateQR": true,
  "scanQR": true,
  "pendingPermissions": true,
  "adminUsers": true,
  "generateReports": true,
  "entrega": true,
  "movimiento": true,
  "egreso": true,
  "admin_usuarios": true,
  "admin_roles": true,
  "admin_sistema": true
}'::json
WHERE rol = 'admin';

-- Verificar que se actualizó correctamente
SELECT id, nombre, rol, permisos FROM users WHERE rol = 'admin';
