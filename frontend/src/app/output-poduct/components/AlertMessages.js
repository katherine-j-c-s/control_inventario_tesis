"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const AlertMessages = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AlertMessages;
