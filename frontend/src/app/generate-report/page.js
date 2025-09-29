"use client";

import Layout from "@/components/layouts/Layout";
import React, { useState } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

const GenerateReportContent = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  return (
    <Layout>
      <h1>Generate Report</h1>
      <p>Bienvenido, {user?.name}</p>
    </Layout>
  );
};

export default function GenerateReport() {
  return (
    <AuthProvider>
      <GenerateReportContent />
    </AuthProvider>
  );
}
