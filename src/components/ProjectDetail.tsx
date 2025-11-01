import { ArrowLeft, BookOpen, Calendar, Users, MessageSquare, FileText, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { getProject } from '@/utils/mockData';
import { Project, Delivery } from '@/types';
import { FeedbackView } from '@/components/FeedbackView';
import { ReportView } from '@/components/ReportView';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { useAuth } from '@/hooks/useAuth';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

type DetailView = 'overview' | 'feedback' | 'report' | 'accessibility';

export const ProjectDetail = ({ projectId, onBack }: ProjectDetailProps) => {
  const [currentView, setCurrentView] = useState<DetailView>('overview');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isProfessor = user?.role === 'profesor';
  const isStudent = user?.role === 'estudiante';

  useEffect(() => {
    const proj = getProject(projectId);
    if (proj) {
      setProject(proj);
    }
  }, [projectId]);

  if (currentView === 'feedback' && selectedDeliveryId) {
    return (
      <FeedbackView
        projectId={projectId}
        deliveryId={selectedDeliveryId}
        onBack={() => {
          setCurrentView('overview');
          setSelectedDeliveryId('');
        }}
      />
    );
  }

  if (currentView === 'report') {
    return (
      <ReportView
        projectId={projectId}
        onBack={() => setCurrentView('overview')}
      />
    );
  }

  if (currentView === 'accessibility') {
    return (
      <AccessibilityPanel
        onBack={() => setCurrentView('overview')}
      />
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <p className="text-muted-foreground">Cargando proyecto...</p>
      </div>
    );
  }

  const mockProjectDetails: Record<string, any> = {
    'proyecto-a': {
      fullDescription: 'Investigación exhaustiva sobre complejidad computacional y optimización de algoritmos de ordenamiento, incluyendo análisis empírico y teórico.',
      instructor: 'Dr. Carlos Rodríguez'
    },
    'proyecto-b': {
      fullDescription: 'Proyecto integral de desarrollo de aplicaciones web modernas utilizando tecnologías como React, Node.js, y bases de datos NoSQL.',
      instructor: 'Ing. Ana Martínez'
    },
    'proyecto-c': {
      fullDescription: 'Implementación práctica de modelos de aprendizaje automático para análisis predictivo en datasets reales del sector empresarial.',
      instructor: 'Dra. Laura Fernández'
    }
  };

  const details = mockProjectDetails[projectId] || { fullDescription: project.description, instructor: 'N/A' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground">Instructor: {details.instructor}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              {project.participants} participantes
            </Badge>
            <Badge variant="outline">
              Fecha límite: {new Date(project.deadline).toLocaleDateString('es-ES')}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Role Badge */}
        {isAdmin && (
          <Alert className="border-warning/50 bg-warning/5">
            <AlertDescription className="text-warning font-medium">
              Vista de administrador - Solo lectura, no puedes modificar entregas ni retroalimentación
            </AlertDescription>
          </Alert>
        )}

        {/* Description */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Descripción del Proyecto
            </CardTitle>
            <CardDescription>
              Descripción del proyecto y objetivos principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{details.fullDescription}</p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              {isAdmin 
                ? 'Funcionalidades disponibles para tu rol' 
                : 'Accede a las funcionalidades del proyecto'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {!isAdmin && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCurrentView('report')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isProfessor ? 'Generar Reporte de Equipo' : 'Ver mi Reporte'}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setCurrentView('accessibility')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Accesibilidad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries */}
        {project.deliveries && project.deliveries.length > 0 && (
          <Card className="border-0 gradient-card">
            <CardHeader>
              <CardTitle>Entregas del Proyecto</CardTitle>
              <CardDescription>
                {project.deliveries.length} entrega(s) programada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.deliveries.map((delivery: Delivery) => (
                  <div
                    key={delivery.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{delivery.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {delivery.description}
                        </p>
                      </div>
                      {delivery.grade && (
                        <Badge className="ml-2">
                          {delivery.grade}/100
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(delivery.dueDate).toLocaleDateString('es-ES')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {delivery.comments.length} comentarios
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDeliveryId(delivery.id);
                        setCurrentView('feedback');
                      }}
                      disabled={isAdmin}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {isAdmin ? 'Ver (Solo lectura)' : 'Ver Retroalimentación'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Equipo</p>
              <p className="text-2xl font-bold text-foreground">{project.teamId}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Entregas</p>
              <p className="text-2xl font-bold text-foreground">{project.deliveries.length}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Comentarios</p>
              <p className="text-2xl font-bold text-foreground">
                {project.deliveries.reduce((sum, d) => sum + d.comments.length, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
