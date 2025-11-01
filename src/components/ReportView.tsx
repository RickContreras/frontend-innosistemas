import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Download, Printer, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getProject, getProjects } from '@/utils/mockData';
import { generateStudentReport, generateTeamReport, downloadPDF, saveReport } from '@/utils/pdfGenerator';
import { Project, Delivery } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ReportViewProps {
  projectId: string;
  onBack: () => void;
}

export const ReportView = ({ projectId, onBack }: ReportViewProps) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [reportHtml, setReportHtml] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const isProfessor = user?.role === 'profesor';
  const isStudent = user?.role === 'estudiante';
  const isAdmin = user?.role === 'admin';
  
  // Default report type based on role
  const [reportType, setReportType] = useState<'student' | 'team'>(
    isProfessor ? 'team' : 'student'
  );

  useEffect(() => {
    const proj = getProject(projectId);
    if (proj) {
      setProject(proj);
      if (proj.deliveries.length > 0) {
        setSelectedDelivery(proj.deliveries[0].id);
      }
    }
  }, [projectId]);

  const handleGenerateReport = async () => {
    if (!project || !user) return;

    setIsGenerating(true);

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let html = '';

    if (reportType === 'student') {
      const delivery = project.deliveries.find(d => d.id === selectedDelivery);
      if (!delivery) {
        toast({
          title: 'Error',
          description: 'No se encontró la entrega seleccionada',
          variant: 'destructive',
        });
        setIsGenerating(false);
        return;
      }
      html = generateStudentReport(project, delivery, user.name);
    } else {
      html = generateTeamReport(project, user.name);
    }

    setReportHtml(html);
    
    // Save report to localStorage
    saveReport({
      projectId: project.id,
      type: reportType,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      contentHtml: html
    });

    setIsGenerating(false);
    
    toast({
      title: 'Reporte generado',
      description: 'El reporte ha sido generado exitosamente',
    });
  };

  const handleDownloadPDF = () => {
    if (!reportHtml || !project) return;
    
    const filename = `${project.name.replace(/\s+/g, '-')}-${reportType}-${Date.now()}.pdf`;
    downloadPDF(reportHtml, filename);
    
    toast({
      title: 'Descargando PDF',
      description: 'El archivo PDF se está descargando',
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <p className="text-muted-foreground">Cargando proyecto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Generación de Reportes
          </h1>
          <p className="text-muted-foreground">{project.name}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Role Information */}
        {isAdmin && (
          <Alert className="mb-6 border-warning/50 bg-warning/5">
            <AlertDescription className="text-warning font-medium">
              Vista de administrador - Solo puedes visualizar reportes existentes
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1 border-0 gradient-card">
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'Vista de reportes del sistema' 
                  : 'Selecciona las opciones del reporte'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAdmin && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
                  <Select value={reportType} onValueChange={(value: 'student' | 'team') => setReportType(value)}>
                    <SelectTrigger aria-label="Tipo de reporte">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Reporte Estudiantil</SelectItem>
                      {isProfessor && <SelectItem value="team">Reporte de Equipo</SelectItem>}
                    </SelectContent>
                  </Select>
                  {isStudent && reportType === 'team' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Solo disponible para profesores
                    </p>
                  )}
                </div>
              )}

              {reportType === 'student' && project.deliveries.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Entrega</label>
                  <Select value={selectedDelivery} onValueChange={setSelectedDelivery}>
                    <SelectTrigger aria-label="Seleccionar entrega">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {project.deliveries.map((delivery) => (
                        <SelectItem key={delivery.id} value={delivery.id}>
                          {delivery.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isAdmin && (
                <Button 
                  onClick={handleGenerateReport} 
                  className="w-full"
                  disabled={isGenerating || (reportType === 'student' && !selectedDelivery)}
                >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </>
                )}
                </Button>
              )}

              {reportHtml && (
                <div className="space-y-2 pt-4 border-t">
                  <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button onClick={handlePrint} variant="outline" className="w-full">
                    <Printer className="w-4 h-4 mr-2" />
                    Vista Imprimible
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="lg:col-span-2 border-0 gradient-card">
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>Visualización del reporte generado</CardDescription>
            </CardHeader>
            <CardContent>
              {!reportHtml ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Selecciona las opciones y genera un reporte para ver la vista previa
                  </p>
                </div>
              ) : (
                <div 
                  className="bg-white p-8 rounded-lg shadow-inner max-h-[600px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: reportHtml }}
                  role="document"
                  aria-label="Vista previa del reporte"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
