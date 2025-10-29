"use client";

import Layout from "@/components/layouts/Layout";
import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { projectAPI } from "@/lib/api";
import ProjectActions from "./ProjectActions";
import ProjectsTable from "./ProjectsTable";
import ProjectModal from "./ProjectModal";
import CardLoadProject from "./CardLoadProject";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const Projects = () => {
  const { user , loading} = useAuth();
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentView, setCurrentView] = useState('all'); // 'all', 'finished', 'active'
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      const response = await projectAPI.getAllProjects();
      setProjects(response.data);
      setCurrentView('all');
      showSuccess('Proyectos cargados correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetFinished = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectAPI.getProjectsByStatus('finalizado');
      setProjects(response.data);
      setCurrentView('finished');
      showSuccess('Proyectos finalizados cargados correctamente');
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
      const response = await projectAPI.getProjectsByStatus('activo');
      setProjects(response.data);
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

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleProjectCreated = (newProject) => {
    // Cerrar el modal
    setIsCreateModalOpen(false);
    
    // Mostrar mensaje de éxito
    showSuccess('Proyecto creado exitosamente');
    
    // Recargar la lista de proyectos
    handleGetAll();
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
              <h1 className="text-3xl font-bold text-foreground">Gestión de Obras</h1>
              <p className="text-lg text-muted-foreground">Bienvenido, {user?.nombre}</p>
            </div>
            <Button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Obra
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
          onGetFinished={handleGetFinished}
          onGetActive={handleGetActive}
          isloading={isloading}
        />

        <div className="bg-card rounded-lg shadow">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {currentView === 'all' && 'Todos los Proyectos'}
              {currentView === 'finished' && 'Proyectos Finalizados'}
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

        {/* Modal para crear nuevo proyecto */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Obra</DialogTitle>
            </DialogHeader>
            <CardLoadProject 
              onProjectCreated={handleProjectCreated}
            />
          </DialogContent>
        </Dialog>
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
