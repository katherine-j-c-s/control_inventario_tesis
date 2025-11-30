import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export const getStatusBadge = (estado) => {
  switch (estado) {
    case "aprobado":
    case "Aprobada":
      return (
        <Badge variant="default" className="bg-primary-500 hover:bg-primary-400 ">
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
        <Badge variant="default" className="bg-primary-700 hover:bg-primary-500 ">
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

