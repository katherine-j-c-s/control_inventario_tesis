"use client";

import Layout from "@/components/layouts/Layout";
import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { projectAPI } from "@/lib/api";
import ProjectActions from "./ProjectActions";
import ProjectsTable from "./ProjectsTable";
import ProjectModal from "./ProjectModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Projects = () => {
  const { user , loading} = useAuth();
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentView, setCurrentView] = useState('all'); // 'all', 'new', 'active'
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const handleError = (error) => {
    console.error('Error:', error);
    setError(error.response?.data?.message || 'Error al procesar la solicitud');
    setSuccess(null);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleGetAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // const response = await projectAPI.getAllProjects();
      setProjects(response.data);
      setCurrentView('all');
      showSuccess('Proyectos cargados correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetNew = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectAPI.getAllProjects();
      const now = new Date();
      const newProjects = response.data.filter(project => {
        const createdDate = new Date(project.created_at);
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        return daysDiff < 7;
      });
      setProjects(newProjects);
      setCurrentView('new');
      showSuccess('Proyectos nuevos cargados correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetActive = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectAPI.getAllProjects();
      const now = new Date();
      const activeProjects = response.data.filter(project => {
        const createdDate = new Date(project.created_at);
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        return daysDiff >= 7 && daysDiff < 30;
      });
      setProjects(activeProjects);
      setCurrentView('active');
      showSuccess('Proyectos activos cargados correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    handleGetAll();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Proyectos</h1>
              <p className="text-lg text-muted-foreground">Bienvenido, {user?.nombre}</p>
            </div>
            <Button 
              onClick={() => {
                console.log('Crear nuevo proyecto');
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Proyecto
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-primary500 bg-primary-50">
            <CheckCircle className="h-4 w-4 text-primary-500" />
            <AlertDescription className="text-gray-700">{success}</AlertDescription>
          </Alert>
        )}

        <ProjectActions
          onGetAll={handleGetAll}
          onGetNew={handleGetNew}
          onGetActive={handleGetActive}
          isloading={isloading}
        />

        <div className="bg-card rounded-lg shadow">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {currentView === 'all' && 'Todos los Proyectos'}
              {currentView === 'new' && 'Proyectos Nuevos'}
              {currentView === 'active' && 'Proyectos Activos'}
            </h2>
            <p className="text-muted-foreground">
              {projects.length} proyecto{projects.length !== 1 ? 's' : ''} encontrado{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="p-4">
            <ProjectsTable
              projects={projects}
              onView={handleView}
            />
          </div>
        </div>

        <ProjectModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          project={selectedProject}
        />
      </div>
    </Layout>
  );
};

export default function ProjectsPage() {
  return (
    <AuthProvider>
      <Projects />
    </AuthProvider>
  );
}
