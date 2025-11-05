"use client";

import React, { useState } from "react";
import { ButtonGroupSeparatorDemo } from "@/components/ButtonGroup";
import ManualReceiptForm from "./ManualReceiptForm";
import PdfReceiptUpload from "./PdfReceiptUpload";

const LoadReceipt = ({ onClose, onReceiptCreated }) => {
  const [activeMode, setActiveMode] = useState("manual"); // "manual" o "pdf"

  return (
    <div className="space-y-6">
      <ButtonGroupSeparatorDemo 
        text="Manual" 
        secondtext="PDF" 
        activeMode={activeMode}
        onSelectManual={() => setActiveMode("manual")}
        onSelectPdf={() => setActiveMode("pdf")}
      />

      {activeMode === "manual" ? (
        <ManualReceiptForm 
          onClose={onClose}
          onReceiptCreated={onReceiptCreated}
        />
      ) : (
        <PdfReceiptUpload 
          onClose={onClose}
          onReceiptCreated={onReceiptCreated}
        />
      )}
    </div>
  );
};

export default LoadReceipt;