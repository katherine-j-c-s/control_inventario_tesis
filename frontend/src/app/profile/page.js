// app/profile/page.js
'use client';

import React, { useEffect } from "react";
import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { FormProfile } from "./formProfile"; // Asegúrate que la importación sea correcta
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

function Profile() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Mi Perfil</CardTitle>
            <CardDescription>
              Aquí puedes ver y actualizar tu información personal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProfile user={user} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <Profile />
    </AuthProvider>
  );
}