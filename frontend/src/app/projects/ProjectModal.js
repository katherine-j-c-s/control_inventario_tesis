"use client";

import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, MapPin, User, Calendar } from "lucide-react";

const ProjectModal = ({ isOpen, onClose, project }) => {
  const { theme } = useTheme();

  if (!project) return null;

  const getStatusBadge = (project) => {
    const createdDate = new Date(project.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      return (
        <Badge variant="default" className="bg-primary">
          <CheckCircle className="w-3 h-3 mr-1" />
          Nuevo
        </Badge>
      );
    } else if (daysDiff < 30) {
      return (
        <Badge variant="secondary" className="bg-yellow-500">
          <Clock className="w-3 h-3 mr-1" />
          Activo
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <XCircle className="w-3 h-3 mr-1" />
          En Progreso
        </Badge>
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Proyecto
          </DialogTitle>
          <DialogDescription>
            Información completa del proyecto seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header con nombre y estado */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">ID: {project.project_id}</p>
                </div>
                {getStatusBadge(project)}
              </div>
            </CardHeader>
            {project.description && (
              <CardContent>
                <p className="text-foreground">{project.description}</p>
              </CardContent>
            )}
          </Card>

          {/* Información del proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  {project.ubicacion || 'No especificada'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Administrador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">ID: {project.admin_id}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha de Creación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{formatDate(project.created_at)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Última Actualización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{formatDate(project.updated_at)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
