import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const CompanyData = ({orderData}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5" />
          Datos de la Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-semibold text-lg">
          {orderData.company_name || "Simetra S.A."}
        </p>
        <p className="text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Dirección: {orderData.company_address || "Av. Simetra 1234, CABA"}
        </p>
      </CardContent>
    </Card>
  );
};

export default CompanyData;
