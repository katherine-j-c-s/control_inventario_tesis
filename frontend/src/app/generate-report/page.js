"use client";

import Layout from "@/components/layouts/Layout";
import { useState } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const GenerateReportContent = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);
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
