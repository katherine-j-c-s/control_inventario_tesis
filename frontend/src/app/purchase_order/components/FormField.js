"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Componente reutilizable para campos de formulario
 * @param {string} label - Etiqueta del campo
 * @param {string} id - ID del input
 * @param {boolean} required - Si el campo es obligatorio
 * @param {string} className - Clases adicionales para el contenedor
 * @param {React.ReactNode} children - Componente personalizado (Select, Textarea, etc.)
 * @param {object} props - Props adicionales para el Input
 */
const FormField = ({ label, id, required = false, className = "", children, ...props }) => (
  <div className={`space-y-2 ${className}`}>
    <Label htmlFor={id} className="text-sm font-medium">
      {label} {required && "*"}
    </Label>
    {children || <Input id={id} required={required} {...props} />}
  </div>
);

export default FormField;

