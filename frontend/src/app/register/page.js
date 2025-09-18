'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

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
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Esperar a que termine de cargar
    
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router, loading]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setRegisterLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;
    userData.edad = parseInt(userData.edad);

    const result = await register(userData, foto);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
    
    setRegisterLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro de Usuario
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Control de Inventario - Petróleo
          </p>
        </div>
        
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg"
          onSubmit={handleSubmit}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="input-field mt-1"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                Apellido *
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                className="input-field mt-1"
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                DNI *
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                className="input-field mt-1"
                value={formData.dni}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field mt-1"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="puesto_laboral" className="block text-sm font-medium text-gray-700">
                Puesto Laboral *
              </label>
              <input
                id="puesto_laboral"
                name="puesto_laboral"
                type="text"
                required
                className="input-field mt-1"
                value={formData.puesto_laboral}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="edad" className="block text-sm font-medium text-gray-700">
                Edad *
              </label>
              <input
                id="edad"
                name="edad"
                type="number"
                required
                min="18"
                max="100"
                className="input-field mt-1"
                value={formData.edad}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                Género *
              </label>
              <select
                id="genero"
                name="genero"
                required
                className="input-field mt-1"
                value={formData.genero}
                onChange={handleChange}
              >
                <option value="">Selecciona...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decir">Prefiero no decir</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="foto" className="block text-sm font-medium text-gray-700">
                Foto de Perfil
              </label>
              <input
                id="foto"
                name="foto"
                type="file"
                accept="image/*"
                className="input-field mt-1"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="6"
                className="input-field mt-1"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength="6"
                className="input-field mt-1"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={registerLoading}
              className={`w-full btn-primary ${registerLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {registerLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </div>
              ) : (
                'Registrar Usuario'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </motion.form>
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
