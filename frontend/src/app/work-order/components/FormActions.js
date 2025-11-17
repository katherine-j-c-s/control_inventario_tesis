import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

const FormActions = ({ loading, onSubmit, onCancel }) => {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <div className="text-sm md:flex hidden text-muted-foreground">
        * Campos obligatorios
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="h-10 px-6"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Enviar Solicitud
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormActions;
