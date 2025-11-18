"use client";

import React, { useState, useEffect } from "react";
import { Save, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { projectAPI } from "@/lib/api";
import { toast } from "sonner";

const EditProjectForm = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ubicacion: '',
    estado: 'activo'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      loadProjectData();
    }
  }, [isOpen, project]);

  const loadProjectData = async () => {
    if (!project?.project_id) return;

    setLoadingProject(true);
    setError(null);

    try {
      // Si el proyecto ya tiene todos los datos, usarlos directamente
      // Si no, hacer una llamada al API para obtenerlos
      if (project.name && project.ubicacion) {
        setFormData({
          name: project.name || '',
          description: project.description || '',
          ubicacion: project.ubicacion || '',
          estado: project.estado || 'activo'
        });
      } else {
        const response = await projectAPI.getProjectById(project.project_id);
        const projectData = response.data;
        
        setFormData({
          name: projectData.name || '',
          description: projectData.description || '',
          ubicacion: projectData.ubicacion || '',
          estado: projectData.estado || 'activo'
        });
      }
    } catch (error) {
      console.error("Error cargando datos del proyecto:", error);
      setError("Error al cargar los datos del proyecto. Inténtalo de nuevo.");
      toast.error("Error al cargar los datos del proyecto");
    } finally {
      setLoadingProject(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre del proyecto es obligatorio");
      toast.error("El nombre del proyecto es obligatorio");
      return false;
    }

    if (formData.name.trim().length < 3) {
      setError("El nombre del proyecto debe tener al menos 3 caracteres");
      toast.error("El nombre del proyecto debe tener al menos 3 caracteres");
      return false;
    }

    if (!formData.ubicacion.trim()) {
      setError("La ubicación del proyecto es obligatoria");
      toast.error("La ubicación del proyecto es obligatoria");
      return false;
    }

    if (formData.ubicacion.trim().length < 3) {
      setError("La ubicación debe tener al menos 3 caracteres");
      toast.error("La ubicación debe tener al menos 3 caracteres");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        ubicacion: formData.ubicacion.trim(),
        estado: formData.estado
      };

      const response = await projectAPI.updateProject(project.project_id, projectData);

      if (response.data.message) {
        setSuccess(`✅ ${response.data.message || "Obra actualizada correctamente"}`);
        toast.success("Obra actualizada exitosamente");

        if (onProjectUpdated) {
          onProjectUpdated();
        }

        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 2000);
      } else {
        setError("Error al actualizar la obra. Inténtalo de nuevo.");
        toast.error("Error al actualizar la obra");
      }

    } catch (error) {
      console.error("Error al actualizar la obra:", error);
      const errorMessage = error.response?.data?.message || "Error al actualizar la obra. Inténtalo de nuevo.";
      setError(`❌ ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccess(null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogTitle className="text-lg sm:text-2xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Editar Obra #{project?.project_id}
        </DialogTitle>
        <DialogDescription>
          Modifica los campos de la obra. Los cambios se guardarán inmediatamente.
        </DialogDescription>

        {loadingProject ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Cargando datos de la obra...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Información de la Obra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nombre del Proyecto *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Ej: Construcción Edificio Residencial"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ubicacion" className="text-sm font-medium">
                        Ubicación *
                      </Label>
                      <Input
                        id="ubicacion"
                        type="text"
                        value={formData.ubicacion}
                        onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                        placeholder="Ej: Buenos Aires, Argentina"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm font-medium">
                        Estado del Proyecto *
                      </Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value) => handleInputChange("estado", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="pausado">Pausado</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Descripción
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Descripción detallada del proyecto..."
                        rows={4}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Actualizar Obra
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectForm;

