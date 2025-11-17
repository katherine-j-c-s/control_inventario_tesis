'use client';

import { useState, useEffect } from 'react';
import { roleAPI } from '@/lib/api';
import { allRoutes } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

// Estructura de permisos que manejaremos
const PERMISSIONS_FROM_ROUTES = Object.entries(allRoutes).map(([key, value]) => ({
  id: key, // ej: "dashboard"
  label: value.text, // ej: "Dashboard"
}));

export function RolesManagementTab({ setSuccess, setError }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Estado inicial del formulario, incluyendo la estructura de permisos
   const initialFormState = {
    nombre: '',
    descripcion: '',
    permisos: PERMISSIONS_FROM_ROUTES.reduce((acc, perm) => ({ ...acc, [perm.id]: false }), {})
  };
  const [formData, setFormData] = useState(initialFormState);


  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleAPI.getRoles();
      setRoles(response.data);
    } catch (err) {
      setError("Error al cargar los roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role = null) => {
    setEditingRole(role);
    if (role) {
      const fullPermissions = { ...initialFormState.permisos, ...role.permisos };
      setFormData({ ...role, permisos: fullPermissions });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permId) => {
    setFormData(prev => ({
      ...prev,
      permisos: { ...prev.permisos, [permId]: !prev.permisos[permId] }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleAPI.updateRole(editingRole.id, formData);
        setSuccess("Rol actualizado exitosamente.");
      } else {
        await roleAPI.createRole(formData);
        setSuccess("Rol creado exitosamente.");
      }
      fetchRoles();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar el rol.");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm("¿Seguro que quieres eliminar este rol?")) return;
    try {
      await roleAPI.deleteRole(roleId);
      setSuccess("Rol eliminado exitosamente.");
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar el rol.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex md:flex-row flex-col items-start md:items-center justify-between">
        <div>
          <CardTitle>Gestión de Roles</CardTitle>
          <CardDescription>Crea y edita los roles y sus permisos específicos.</CardDescription>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Rol
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Permisos Asignados</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Cargando roles...</TableCell></TableRow>
              ) : (
                roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{role.descripcion}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permisos)
                          .filter(([, value]) => value)
                          .map(([key]) => (
                            <Badge key={key} variant="secondary">{allRoutes[key]?.text || key}</Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(role)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteRole(role.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* MODAL PARA CREAR/EDITAR ROL CON PERMISOS */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">Nombre</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descripcion" className="text-right">Descripción</Label>
                <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Permisos</Label>
                <div className="col-span-3 space-y-2">
                  {PERMISSIONS_FROM_ROUTES.map(perm => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={perm.id}
                        checked={!!formData.permisos[perm.id]}
                        onCheckedChange={() => handlePermissionChange(perm.id)}
                      />
                      <Label htmlFor={perm.id} className="font-normal">{perm.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}