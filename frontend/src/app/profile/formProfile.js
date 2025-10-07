// app/profile/formProfile.js
'use client';

import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authAPI } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Upload, Trash2 } from "lucide-react";

export function FormProfile({ user }) {
  const { updateUserData } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    dni: user?.dni || "",
    email: user?.email || "",
    puesto_laboral: user?.puesto_laboral || "",
    edad: user?.edad || "",
    genero: user?.genero || ""
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const file = fileInputRef.current?.files[0];
      const response = await authAPI.updateProfile(formData, file);

      updateUserData(response.data.user);

      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
      setIsEditing(false);
      setPreviewImage(null); // Limpiar previsualización
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar el perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar el formulario a los datos originales del usuario
    setFormData({
      nombre: user?.nombre || "",
      apellido: user?.apellido || "",
      dni: user?.dni || "",
      email: user?.email || "",
      puesto_laboral: user?.puesto_laboral || "",
      edad: user?.edad || "",
      genero: user?.genero || ""
    });
    setPreviewImage(null);
    setIsEditing(false);
  };

  const userPhoto = user?.foto ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${user.foto}` : null;

  return (
    <div className="space-y-8">
      {/* SECCIÓN DE FOTO DE PERFIL */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-muted">
          <AvatarImage src={previewImage || userPhoto} />
          <AvatarFallback className="text-3xl">
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!isEditing}>
            <Upload className="mr-2 h-4 w-4" />
            Subir foto
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      {/* MENSAJES DE ESTADO */}
      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-green-500' : ''}>
          <Terminal className="h-4 w-4" />
          <AlertTitle>{message.type === 'error' ? 'Error' : 'Éxito'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input id="dni" name="dni" value={formData.dni} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="puesto_laboral">Puesto Laboral</Label>
            <Select onValueChange={(value) => handleSelectChange('puesto_laboral', value)} value={formData.puesto_laboral} disabled={!isEditing}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contol calidad ">Control de Calidad</SelectItem>
                <SelectItem value="operario">Operario de almacen</SelectItem>
                <SelectItem value="gerente">Gerente de almacen</SelectItem>
                <SelectItem value="supervisor">Supervisor de proyectos</SelectItem>
                <SelectItem value="operador maquinaria">Operador de maquinaria pesada</SelectItem>
                <SelectItem value="ingeniero">Ingeniero de perforación</SelectItem>
                <SelectItem value="operador planta">Operador de planta</SelectItem>
                <SelectItem value="analista stock">Analista de control de stock</SelectItem>
                <SelectItem value="gerente admin">Gerente administrativo</SelectItem>
                <SelectItem value="supervisor hse">Supervisor HSE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edad">Edad</Label>
            <Input id="edad" name="edad" type="number" value={formData.edad} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genero">Género</Label>
            <Select onValueChange={(value) => handleSelectChange('genero', value)} value={formData.genero} disabled={!isEditing}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end space-x-4 pt-6">
          {!isEditing ? (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}