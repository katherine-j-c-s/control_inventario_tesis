'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userAPI } from '@/lib/api';
import { rolesConfig } from '@/lib/roles';
import ProfileImage from '@/components/ProfileImage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, Trash2 } from "lucide-react";

export function AllUsersTab({ setSuccess, setError }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUsers();
        setUsers(response.data);
      } catch (err) {
        setError('Error al cargar usuarios.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [setError]);

  const handleDeleteUser = async (userId, userName) => {

    const confirmation = confirm(
      `¿Estás seguro de que quieres eliminar a ${userName}?\n\n⚠️ ¡Esta acción es PERMANENTE e IRREVERSIBLE!`
    );

    if (!confirmation) return;

    try {
      await userAPI.deleteUser(userId);
      setSuccess(`Usuario ${userName} eliminado permanentemente.`);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (err) {
      setError('Error al eliminar el usuario.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Usuarios del Sistema</CardTitle>
        <CardDescription>Visualiza, busca y administra todos los usuarios activos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Información</TableHead>
                <TableHead>Rol Asignado</TableHead>
                <TableHead>Secciones con Acceso</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24">Cargando...</TableCell></TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <ProfileImage user={user} size="md" />
                        <div>
                          <p>{user.nombre} {user.apellido}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">DNI: {user.dni}</p>
                      <p className="text-sm text-muted-foreground">{user.puesto_laboral}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rolesConfig[user.rol]?.name || user.rol}</Badge>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rolesConfig[user.rol]?.routes.map((route, i) => (
                            <Tooltip key={i} delayDuration={100}>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <route.icon className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{route.text}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      {currentUser.id !== user.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900" onClick={() => handleDeleteUser(user.id, `${user.nombre} ${user.apellido}`)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}