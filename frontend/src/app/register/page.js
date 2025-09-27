'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { rolesConfig } from '@/lib/roles';

// Componentes de ShadCN/UI y Lucide Icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal } from "lucide-react";

function RegisterForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    puesto_laboral: '',
    edad: '',
    genero: '',
    password: '',
    confirmPassword: ''
  });
  const [foto, setFoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const userRole = user.rol || 'default';
      const redirectPath = rolesConfig[userRole]?.defaultRoute || '/dashboard';
      router.push(redirectPath);
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;
    userData.edad = parseInt(userData.edad);

    const result = await register(userData, foto);
    
    // La redirección se maneja en el useEffect
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  if (loading || user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Registro de Nuevo Usuario</CardTitle>
            <CardDescription>Completa el formulario para crear tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error en el Registro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI *</Label>
                  <Input id="dni" name="dni" value={formData.dni} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="puesto_laboral">Puesto Laboral *</Label>
                  <Input id="puesto_laboral" name="puesto_laboral" value={formData.puesto_laboral} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad *</Label>
                  <Input id="edad" name="edad" type="number" min="18" max="100" value={formData.edad} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Género *</Label>
                  <Select onValueChange={(value) => handleSelectChange('genero', value)} value={formData.genero} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                      <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foto">Foto de Perfil</Label>
                  <Input id="foto" name="foto" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input id="password" name="password" type="password" minLength="6" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" minLength="6" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creando cuenta...' : 'Registrar Usuario'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}