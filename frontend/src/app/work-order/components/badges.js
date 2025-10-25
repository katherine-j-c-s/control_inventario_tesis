import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export const getStatusBadge = (estado) => {
  switch (estado) {
    case "aprobado":
    case "Aprobada":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprobada
        </Badge>
      );
    case "rechazado":
    case "Rechazada":
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rechazada
        </Badge>
      );
    case "pendiente":
    case "Pendiente":
      return (
        <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-500">
          <Clock className="w-3 h-3 mr-1" />
          Pendiente
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle className="w-3 h-3 mr-1" />
          {estado}
        </Badge>
      );
  }
};

