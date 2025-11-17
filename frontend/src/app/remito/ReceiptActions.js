"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  List
} from "lucide-react";

const ReceiptActions = ({ 
  onGetAll, 
  onGetUnverified, 
  onGetVerified, 
  loading = false 
}) => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 overflow-x-auto scrollbar-hide pb-2">
      {/* Botón para obtener todos los remitos */}
      <Card className="bg-card border-border flex-shrink-0 min-w-[200px] sm:min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-foreground">
            <List className="w-4 h-4 mr-2" />
            Todos los Remitos
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

      {/* Botón para obtener remitos no verificados */}
      <Card className="bg-card border-border flex-shrink-0 min-w-[200px] sm:min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-foreground">
            <XCircle className="w-4 h-4 mr-2 " />
            No Verificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onGetUnverified} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-300 border-t-red-600 rounded-full" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Ver No Verificados
          </Button>
        </CardContent>
      </Card>

      {/* Botón para obtener remitos verificados */}
      <Card className="bg-card border-border flex-shrink-0 min-w-[200px] sm:min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-foreground">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onGetVerified} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-300 border-t-primary-600 rounded-full" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Ver Verificados
          </Button>
        </CardContent>
      </Card>


    </div>
  );
};

export default ReceiptActions;
