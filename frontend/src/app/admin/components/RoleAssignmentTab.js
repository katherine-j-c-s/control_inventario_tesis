'use client';

import { useState, useEffect } from 'react';
import { userAPI, roleAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileImage from '@/components/ProfileImage';

export function RoleAssignmentTab({ setSuccess, setError }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([userAPI.getUsers(), roleAPI.getRoles()]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        setError("Error al cargar datos para la asignación.");
      }
    };
    fetchData();
  }, [setError]);
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Para reflejar cambios en tiempo real si se actualiza la lista de usuarios
    const freshUserData = users.find(u => u.id === user.id);
    setSelectedUser(freshUserData);
  };

  const handleAssignRole = async (roleName) => {
    if (!selectedUser) return;
    const confirmationMessage = selectedUser.rol
      ? `El usuario ya tiene el rol '${selectedUser.rol}'. ¿Deseas reemplazarlo por '${roleName}'?`
      : `¿Seguro que quieres asignar el rol '${roleName}'?`;

    if (!confirm(confirmationMessage)) return;

    try {
      await userAPI.updateUserRole(selectedUser.id, roleName);
      setSuccess(`Rol '${roleName}' asignado a ${selectedUser.nombre}.`);
      // Actualizamos el estado local para reflejar el cambio en la UI
      const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, rol: roleName } : u);
      setUsers(updatedUsers);
      setSelectedUser(prev => ({ ...prev, rol: roleName }));
    } catch (err) {
      setError(err.response?.data?.message || "Error al asignar el rol.");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedUser?.id === user.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ProfileImage user={user} size="sm" />
                    <div>
                      <p className="font-medium">{user.nombre} {user.apellido}</p>
                      <p className="text-xs text-muted-foreground">{user.rol || 'Sin rol'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Asignar Rol</CardTitle>
          {selectedUser && <CardDescription>Gestionando a: {selectedUser.nombre} {selectedUser.apellido}</CardDescription>}
        </CardHeader>
        <CardContent>
          {selectedUser ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Rol Actual</h4>
                <p className="text-muted-foreground p-3 bg-muted rounded-md">{selectedUser.rol || 'No asignado'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Roles Disponibles</h4>
                <div className="space-y-2">
                  {roles.filter(r => r.nombre !== selectedUser.rol).map(role => (
                    <div key={role.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                      <span>{role.nombre}</span>
                      <Button size="sm" onClick={() => handleAssignRole(role.nombre)}>Asignar</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Selecciona un usuario de la lista.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}