"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { projectAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle, Plus, Loader2 } from "lucide-react";

const CardLoadProject = ({ onProjectCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ubicacion: '',
    estado: 'activo'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      estado: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name.trim()) {
      setError('El nombre del proyecto es obligatorio');
      return;
    }
    
    if (formData.name.trim().length < 3) {
      setError('El nombre del proyecto debe tener al menos 3 caracteres');
      return;
    }
    
    if (!formData.ubicacion.trim()) {
      setError('La ubicación del proyecto es obligatoria');
      return;
    }
    
    if (formData.ubicacion.trim().length < 3) {
      setError('La ubicación debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verificar que el usuario esté autenticado
      if (!user || !user.id) {
        setError('Debe estar autenticado para crear un proyecto');
        return;
      }

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        ubicacion: formData.ubicacion.trim(),
        estado: formData.estado,
        admin_id: user.id
      };

      console.log('Enviando datos del proyecto:', projectData);
      
      const response = await projectAPI.createProject(projectData);
      
      console.log('Proyecto creado exitosamente:', response.data);
      
      setSuccess('Proyecto creado exitosamente');
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        ubicacion: '',
        estado: 'activo'
      });

      // Notificar al componente padre si existe
      if (onProjectCreated) {
        onProjectCreated(response.data.project || response.data);
      }

      // Auto-ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Error creando proyecto:', error);
      
      // Manejo específico de diferentes tipos de errores
      if (error.response) {
        // Error del servidor
        const serverMessage = error.response.data?.message || 'Error del servidor';
        setError(`Error: ${serverMessage}`);
      } else if (error.request) {
        // Error de red
        setError('Error de conexión. Verifique su conexión a internet.');
      } else {
        // Otro tipo de error
        setError('Error inesperado al crear el proyecto');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ubicacion: '',
      estado: 'activo'
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Cargar Nueva Obra
        </CardTitle>
        {user && (
          <p className="text-sm text-muted-foreground">
            Creando como: <span className="font-medium">{user.nombre} {user.apellido}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del Proyecto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proyecto *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ej: Construcción Edificio Residencial"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación *</Label>
            <Input
              id="ubicacion"
              name="ubicacion"
              type="text"
              placeholder="Ej: Buenos Aires, Argentina"
              value={formData.ubicacion}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado del Proyecto</Label>
            <Select value={formData.estado} onValueChange={handleSelectChange} disabled={loading}>
              <SelectTrigger>
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

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descripción detallada del proyecto..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={4}
            />
          </div>

          {/* Información del usuario */}
          {user && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Administrador:</strong> {user.nombre} {user.apellido} (ID: {user.id})
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !user}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando proyecto...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Proyecto
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              disabled={loading}
            >
              Limpiar
            </Button>
          </div>

          {!user && (
            <p className="text-sm text-destructive text-center mt-2">
              Debe estar autenticado para crear un proyecto
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CardLoadProject;
