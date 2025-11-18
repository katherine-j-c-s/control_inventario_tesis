"use client";

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
import { CheckCircle, XCircle, Clock, Eye, MapPin, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const ProjectsTable = ({ projects, onView, onEdit }) => {
  const getStatusBadge = (project) => {
    const estado = project.estado || 'activo';
    const baseClasses =
      "border-0 text-xs font-semibold px-2.5 py-1 rounded-full";
    
    switch (estado) {
      case 'finalizado':
        return (
          <Badge
            variant="secondary"
            className={cn(
              baseClasses,
              "bg-emerald-500 text-emerald-50 dark:bg-emerald-400 dark:text-emerald-900"
            )}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        );
      case 'activo':
        return (
          <Badge
            variant="secondary"
            className={cn(
              baseClasses,
              "bg-primary text-primary-foreground"
            )}
          >
            <Clock className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        );
      case 'pausado':
        return (
          <Badge
            variant="secondary"
            className={cn(
              baseClasses,
              "bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-900"
            )}
          >
            <Clock className="w-3 h-3 mr-1" />
            Pausado
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge
            variant="destructive"
            className={cn(
              baseClasses,
              "bg-destructive text-destructive-foreground"
            )}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className={cn(
              baseClasses,
              "bg-muted text-foreground"
            )}
          >
            <Clock className="w-3 h-3 mr-1" />
            Activo
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
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(project)}
                          className="border-border hover:bg-muted"
                        >
                          <Pencil className="w-4 h-4" />
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
      </div>

      <div className="space-y-3 md:hidden">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.project_id}
              className="border border-border rounded-lg p-4 bg-muted/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Obra</p>
                  <p className="text-lg font-semibold text-foreground">
                    {project.name}
                  </p>
                </div>
                {getStatusBadge(project)}
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-medium">{project.project_id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Admin</dt>
                  <dd className="font-medium">{project.admin_id || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ubicación</dt>
                  <dd className="font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.ubicacion || "Sin ubicación"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Creado</dt>
                  <dd className="font-medium">
                    {formatDate(project.created_at)}
                  </dd>
                </div>
              </dl>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onView(project)}
                >
                  Ver Detalles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(project)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-6">
            No hay proyectos disponibles
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectsTable;