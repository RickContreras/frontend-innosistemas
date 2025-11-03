import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  GraduationCap, 
  LogOut, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  ShieldCheck,
  ShieldX,
  ChevronRight,
  User,
  Settings,
  UserCog,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/UserProfile';
import { UserManagement } from '@/components/UserManagement';
import { apiService } from '@/services/api';
import type { ProjectFromAPI, Project } from '@/types';

// Mock data para proyectos (fallback si falla la API)
const mockProjects: Project[] = [
  {
    id: 'proyecto-a',
    name: 'Análisis de Algoritmos',
    description: 'Investigación sobre complejidad computacional y optimización de algoritmos de ordenamiento.',
    status: 'active',
    participants: 15,
    deadline: '2024-12-15',
    category: 'investigacion',
    teamId: '1',
    deliveries: []
  },
  {
    id: 'proyecto-b',
    name: 'Desarrollo Web Avanzado',
    description: 'Proyecto de desarrollo de aplicaciones web modernas con React y Node.js.',
    status: 'active',
    participants: 8,
    deadline: '2024-11-30',
    category: 'desarrollo',
    teamId: '1',
    deliveries: []
  },
  {
    id: 'proyecto-c',
    name: 'Machine Learning Aplicado',
    description: 'Implementación de modelos de aprendizaje automático para análisis de datos.',
    status: 'pending',
    participants: 12,
    deadline: '2025-01-20',
    category: 'analisis',
    teamId: '1',
    deliveries: []
  }
];

interface DashboardProps {
  onProjectSelect: (projectId: string) => void;
  onLogout: () => void;
}

export const Dashboard = ({ onProjectSelect, onLogout }: DashboardProps) => {
  const { user, hasRole, logAccessAttempt, logout } = useAuth();
  const [accessError, setAccessError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para transformar ProjectFromAPI a Project
  const transformProject = (apiProject: ProjectFromAPI): Project => {
    // Mapear statusId a status
    const statusMap: { [key: number]: 'active' | 'completed' | 'pending' } = {
      1: 'active',
      2: 'completed',
      3: 'pending'
    };

    // Categoría por defecto basada en el nombre del proyecto
    const category: 'investigacion' | 'desarrollo' | 'analisis' = 
      apiProject.name.toLowerCase().includes('investiga') ? 'investigacion' :
      apiProject.name.toLowerCase().includes('desarroll') ? 'desarrollo' :
      'analisis';

    return {
      id: apiProject.id.toString(),
      name: apiProject.name,
      description: apiProject.description,
      status: statusMap[apiProject.statusId] || 'active',
      participants: 0, // No disponible en el API
      deadline: new Date(apiProject.createdAt).toISOString().split('T')[0],
      category,
      teamId: apiProject.courseId.toString(),
      deliveries: []
    };
  };

  // Cargar proyectos del estudiante
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Por ahora usamos el ID 1 de forma hardcoded
        // TODO: Obtener el studentId real del usuario autenticado
        const studentId = 1;
        
        const response = await apiService.getProjectsByStudent(studentId);
        
        if (response.error) {
          setError(response.error);
          // Si hay error, usar los datos mock
          setProjects(mockProjects);
        } else if (response.data) {
          const transformedProjects = response.data.map(transformProject);
          setProjects(transformedProjects);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Error al cargar los proyectos');
        // Si hay error, usar los datos mock
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  // Autorización por roles
  const hasProjectAccess = (projectId: string): boolean => {
    if (!user) return false;
    
    // Admin y profesor tienen acceso a todos los proyectos
    const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER');
    if (isAdmin) return true;
    
    // Los estudiantes tienen acceso a los proyectos que vienen del API
    // (el API ya filtra por studentId)
    return hasRole('ROLE_STUDENT');
  };

  // Filter projects based on user role
  const visibleProjects = projects.filter(project => {
    const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER');
    if (isAdmin) {
      return true; // Admin sees all projects (read-only)
    }
    return hasProjectAccess(project.id);
  });

  const handleProjectClick = (project: Project) => {
    const hasAccess = hasProjectAccess(project.id);
    const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER');
    
    logAccessAttempt(project.id, hasAccess || isAdmin);
    
    if (hasAccess || isAdmin) {
      setAccessError('');
      onProjectSelect(project.id);
    } else {
      setAccessError(`Acceso denegado al ${project.name}. Contacta al administrador para solicitar permisos.`);
    }
  };

  const getRoleBadgeText = () => {
    if (hasRole('ROLE_ADMIN')) return 'Administrador';
    if (hasRole('ROLE_TEACHER')) return 'Profesor';
    if (hasRole('ROLE_STUDENT')) return 'Estudiante';
    return 'Usuario';
  };

  const getRoleDescription = () => {
    if (hasRole('ROLE_ADMIN')) return 'Vista general de todos los proyectos y gestión de usuarios';
    if (hasRole('ROLE_TEACHER')) return 'Puedes enviar retroalimentación y generar reportes de equipo';
    if (hasRole('ROLE_STUDENT')) return 'Puedes ver tus proyectos asignados y recibir retroalimentación';
    return '';
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-accent text-accent-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getCategoryIcon = (category: Project['category']) => {
    switch (category) {
      case 'investigacion': return <BookOpen className="w-4 h-4" />;
      case 'desarrollo': return <Users className="w-4 h-4" />;
      case 'analisis': return <Calendar className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getAuthorizedProjectsCount = () => {
    return projects.filter(project => hasProjectAccess(project.id)).length;
  };

  if (!user) {
    return <div>No hay información de usuario disponible</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">InnoSistemas</h1>
              <p className="text-sm text-muted-foreground">Sistema Académico</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Perfil de usuario */}
            <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-secondary-foreground" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">Ver perfil</p>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Perfil de Usuario</SheetTitle>
                  <SheetDescription>
                    Información de tu cuenta y sesión actual
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <UserProfile 
                    onClose={() => setProfileOpen(false)}
                    onLogout={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Gestión de usuarios (solo para admin) */}
            {hasRole('ROLE_STUDENT') && hasRole('ROLE_TEACHER') && (
              <Sheet open={userManagementOpen} onOpenChange={setUserManagementOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserCog className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Usuarios</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-2xl">
                  <SheetHeader>
                    <SheetTitle>Gestión de Usuarios</SheetTitle>
                    <SheetDescription>
                      Administra los usuarios y roles del sistema
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <UserManagement onClose={() => setUserManagementOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground transition-smooth"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-slide-up">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Bienvenido, {user?.username}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {getRoleDescription()}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {getRoleBadgeText()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')
                ? `Visualizando ${visibleProjects.length} proyecto(s) del sistema`
                : `Tienes acceso a ${visibleProjects.length} proyecto(s)`
              }
            </p>
          </div>

          {/* Error de conexión con el API */}
          {error && (
            <Alert className="mb-6 border-warning/50 bg-warning/5">
              <AlertDescription className="text-warning-foreground font-medium">
                {error}. Mostrando datos de ejemplo.
              </AlertDescription>
            </Alert>
          )}

          {accessError && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/5">
              <ShieldX className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                {accessError}
              </AlertDescription>
            </Alert>
          )}

          {/* Vista de carga */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Cargando proyectos...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project, index) => {
              const hasAccess = hasProjectAccess(project.id);
              const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER');
              
              return (
                <Card 
                  key={project.id}
                  className={`cursor-pointer transition-bounce hover:shadow-elevated border-0 gradient-card animate-scale-in ${
                    hasAccess || isAdmin
                      ? 'hover:scale-105' 
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleProjectClick(project)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(project.category)}
                        <CardTitle className="text-lg font-semibold">
                          {project.name}
                        </CardTitle>
                      </div>
                      {isAdmin ? (
                        <Badge variant="outline" className="text-xs">Admin</Badge>
                      ) : hasAccess ? (
                        <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0" />
                      ) : (
                        <ShieldX className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                      {isAdmin ? (
                        <Badge variant="secondary" className="text-xs">
                          Solo lectura
                        </Badge>
                      ) : hasAccess && (
                        <Badge variant="outline" className="text-xs">
                          Acceso autorizado
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{project.participants} participantes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {(hasAccess || isAdmin) && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-accent font-medium">
                          {isAdmin ? 'Ver proyecto' : 'Acceder al proyecto'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}

          {/* Estado vacío si no hay proyectos autorizados */}
          {!loading && getAuthorizedProjectsCount() === 0 && (
            <div className="text-center py-12">
              <ShieldX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Sin proyectos autorizados</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Actualmente no tienes acceso a ningún proyecto. Contacta al administrador para solicitar permisos.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};