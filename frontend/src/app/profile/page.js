"use client";

import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import FormProfile from "./formProfile";

function Profile() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className=" px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-[#000000] "
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-[#000000]">{user?.name || "Usuario"}</h1>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <FormProfile user={user} />
        </div>
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
