"use client";

import { useTheme } from "next-themes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye, MapPin } from "lucide-react";

const ProjectsTable = ({ projects, onView }) => {
  const { theme } = useTheme();
  
  const getStatusBadge = (project) => {
    // Simple status logic based on creation date
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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full border-none">
      <Table>
        <TableHeader>
          <TableRow className="">
            <TableHead className="text-foreground">ID</TableHead>
            <TableHead className="text-foreground">Nombre</TableHead>
            <TableHead className="text-foreground">Ubicación</TableHead>
            <TableHead className="text-foreground">Fecha de Creación</TableHead>
            <TableHead className="text-foreground">Estado</TableHead>
            <TableHead className="text-foreground">Admin ID</TableHead>
            <TableHead className="text-foreground">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <TableRow key={project.project_id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">
                  {project.project_id}
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    {project.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {project.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                    <span>{project.ubicacion || 'Sin ubicación'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{formatDate(project.created_at)}</TableCell>
                <TableCell>
                  {getStatusBadge(project)}
                </TableCell>
                <TableCell className="text-foreground">{project.admin_id || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(project)}
                      className="border-border hover:bg-muted"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-border">
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No hay proyectos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsTable;