import { useState } from 'react';
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
  UserCog
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/UserProfile';
import { UserManagement } from '@/components/UserManagement';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  participants: number;
  deadline: string;
  category: 'investigacion' | 'desarrollo' | 'analisis';
}

// Mock data para proyectos (se mantendrá hasta que esté el microservicio)
const mockProjects: Project[] = [
  {
    id: 'proyecto-a',
    name: 'Análisis de Algoritmos',
    description: 'Investigación sobre complejidad computacional y optimización de algoritmos de ordenamiento.',
    status: 'active',
    participants: 15,
    deadline: '2024-12-15',
    category: 'investigacion'
  },
  {
    id: 'proyecto-b',
    name: 'Desarrollo Web Avanzado',
    description: 'Proyecto de desarrollo de aplicaciones web modernas con React y Node.js.',
    status: 'active',
    participants: 8,
    deadline: '2024-11-30',
    category: 'desarrollo'
  },
  {
    id: 'proyecto-c',
    name: 'Machine Learning Aplicado',
    description: 'Implementación de modelos de aprendizaje automático para análisis de datos.',
    status: 'pending',
    participants: 12,
    deadline: '2025-01-20',
    category: 'analisis'
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

  // Simulación de autorización por roles (hasta que esté el microservicio de proyectos)
  const hasProjectAccess = (projectId: string): boolean => {
    if (!user) return false;
    
    // Lógica temporal basada en roles:
    // ROLE_STUDENT: Solo proyecto-a
    // ROLE_TEACHER: proyecto-a y proyecto-b  
    // Admin (ambos roles): todos los proyectos
    
    const isAdmin = hasRole('ROLE_STUDENT') && hasRole('ROLE_TEACHER');
    const isStudent = hasRole('ROLE_STUDENT') && !hasRole('ROLE_TEACHER');
    const isTeacher = hasRole('ROLE_TEACHER') && !hasRole('ROLE_STUDENT');
    
    if (isAdmin) return true;
    if (isStudent) return projectId === 'proyecto-a';
    if (isTeacher) return ['proyecto-a', 'proyecto-b'].includes(projectId);
    
    return false;
  };

  // Filter projects based on user role
  const visibleProjects = mockProjects.filter(project => {
    if (user?.role === 'admin') {
      return true; // Admin sees all projects (read-only)
    }
    return hasProjectAccess(project.id);
  });

  const handleProjectClick = (project: Project) => {
    const hasAccess = hasProjectAccess(project.id);
    const isAdmin = user?.role === 'admin';
    
    logAccessAttempt(project.id, hasAccess || isAdmin);
    
    if (hasAccess || isAdmin) {
      setAccessError('');
      onProjectSelect(project.id);
    } else {
      setAccessError(`Acceso denegado al ${project.name}. Contacta al administrador para solicitar permisos.`);
    }
  };

  const getRoleBadgeText = () => {
    switch (user?.role) {
      case 'estudiante': return 'Estudiante';
      case 'profesor': return 'Profesor';
      case 'admin': return 'Administrador';
      default: return user?.role;
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'estudiante': return 'Puedes ver tus proyectos asignados y recibir retroalimentación';
      case 'profesor': return 'Puedes enviar retroalimentación y generar reportes de equipo';
      case 'admin': return 'Vista general de todos los proyectos (solo lectura)';
      default: return '';
    }
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
    return mockProjects.filter(project => hasProjectAccess(project.id)).length;
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
                  Bienvenido, {user?.name}
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
              {user?.role === 'admin' 
                ? `Visualizando ${visibleProjects.length} proyecto(s) del sistema`
                : `Tienes acceso a ${user?.authorizedProjects.length} proyecto(s)`
              }
            </p>
          </div>

          {accessError && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/5">
              <ShieldX className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                {accessError}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project, index) => {
              const hasAccess = hasProjectAccess(project.id);
              const isAdmin = user?.role === 'admin';
              
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

          {/* Estado vacío si no hay proyectos autorizados */}
          {getAuthorizedProjectsCount() === 0 && (
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