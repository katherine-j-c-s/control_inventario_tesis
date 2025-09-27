'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layouts/Layout';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Settings, UserPlus, Terminal } from "lucide-react";

// Importamos los componentes de las pestañas
import { AllUsersTab } from './components/AllUsersTab';
import { RolesManagementTab } from './components/RolesManagementTab';
import { RoleAssignmentTab } from './components/RoleAssignmentTab';

function UsersAdminContent() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user === null && !localStorage.getItem('token')) {
        router.push('/login');
    } else if (user && !isAdmin()) {
        router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    let timer;
    if (success) timer = setTimeout(() => setSuccess(''), 4000);
    if (error) timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [success, error]);

  if (!user || !isAdmin()) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  const tabs = [
    { id: 'users', label: 'Administrar Usuarios', icon: Users },
    { id: 'roles', label: 'Gestión de Roles', icon: Settings },
    { id: 'assign', label: 'Asignación de Roles', icon: UserPlus },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Administración</h1>
          <p className="mt-1 text-muted-foreground">Gestiona usuarios, roles y permisos del sistema.</p>
        </motion.div>
        
        <AnimatePresence>
          {success && 
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert className="border-green-500 text-green-700 dark:border-green-700 dark:text-green-300">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>¡Éxito!</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            </motion.div>
          }
          {error && 
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </motion.div>
          }
        </AnimatePresence>

        <div className="flex space-x-2 border-b">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-b-none transition-all duration-200 ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'users' && <AllUsersTab setSuccess={setSuccess} setError={setError} />}
              {activeTab === 'roles' && <RolesManagementTab setSuccess={setSuccess} setError={setError} />}
              {activeTab === 'assign' && <RoleAssignmentTab setSuccess={setSuccess} setError={setError} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

export default function UsersAdminPage() {
  return (
    <AuthProvider>
      <UsersAdminContent />
    </AuthProvider>
  );
}