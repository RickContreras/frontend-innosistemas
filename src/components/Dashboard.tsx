import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  participants: number;
  deadline: string;
  category: 'investigacion' | 'desarrollo' | 'analisis';
}

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
  const { user, hasProjectAccess, logAccessAttempt } = useAuth();
  const [accessError, setAccessError] = useState('');

  const handleProjectClick = (project: Project) => {
    const hasAccess = hasProjectAccess(project.id);
    
    logAccessAttempt(project.id, hasAccess);
    
    if (hasAccess) {
      setAccessError('');
      onProjectSelect(project.id);
    } else {
      setAccessError(`Acceso denegado al ${project.name}. Contacta al administrador para solicitar permisos.`);
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
              <h1 className="text-xl font-bold text-foreground">Sistema Académico</h1>
              <p className="text-sm text-muted-foreground">Dashboard de Proyectos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="hover:bg-destructive hover:text-destructive-foreground transition-smooth"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Bienvenido, {user?.name}
            </h2>
            <p className="text-muted-foreground">
              Selecciona un proyecto para continuar. Tienes acceso a {user?.authorizedProjects.length} proyecto(s).
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
            {mockProjects.map((project, index) => {
              const hasAccess = hasProjectAccess(project.id);
              
              return (
                <Card 
                  key={project.id}
                  className={`cursor-pointer transition-bounce hover:shadow-elevated border-0 gradient-card animate-scale-in ${
                    hasAccess 
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
                      {hasAccess ? (
                        <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0" />
                      ) : (
                        <ShieldX className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                      {hasAccess && (
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
                    
                    {hasAccess && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-accent font-medium">Acceder al proyecto</span>
                        <ChevronRight className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 gradient-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Proyectos Disponibles</h3>
                <p className="text-2xl font-bold text-primary mt-2">{mockProjects.length}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 gradient-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Acceso Autorizado</h3>
                <p className="text-2xl font-bold text-accent mt-2">{user?.authorizedProjects.length}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 gradient-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground">Rol del Usuario</h3>
                <p className="text-lg font-bold text-warning mt-2 capitalize">{user?.role}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};