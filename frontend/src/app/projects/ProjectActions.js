"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  List,
  Clock
} from "lucide-react";

const ProjectActions = ({ 
  onGetAll, 
  onGetNew, 
  onGetActive, 
  loading = false 
}) => {
  const { theme } = useTheme();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Botón para obtener todos los proyectos */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-foreground">
            <List className="w-4 h-4 mr-2" />
            Todos los Proyectos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onGetAll} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full" />
            ) : (
              <List className="w-4 h-4 mr-2" />
            )}
            Ver Todos
          </Button>
        </CardContent>
      </Card>

      {/* Botón para obtener proyectos nuevos */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-foreground">
            <CheckCircle className="w-4 h-4 mr-2" />
            Proyectos Nuevos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onGetNew} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-300 border-t-primary-600 rounded-full" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Ver Nuevos
          </Button>
        </CardContent>
      </Card>

      {/* Botón para obtener proyectos activos */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-foreground">
            <Clock className="w-4 h-4 mr-2" />
            Proyectos Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onGetActive} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-300 border-t-yellow-600 rounded-full" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            Ver Activos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectActions;
