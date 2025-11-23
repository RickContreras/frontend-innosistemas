/**
 * Servicio para manejar las operaciones de reportes
 * Integración con el microservicio de Feedback
 */

const FEEDBACK_SERVICE_URL = import.meta.env.VITE_FEEDBACK_SERVICE_URL;

console.log('🔧 [ReportService] Configuración:', {
  FEEDBACK_SERVICE_URL
});

export interface DeliveryInfo {
  deliveryId: number;
  deliveryTitle: string;
  submittedAt: string;
  tasksCompleted: number;
  totalTasks: number;
  feedbackCount: number;
}

export interface FeedbackInfo {
  feedbackId: number;
  content: string;
  createdAt: string;
  scope: string;
  scopeId: number;
  scopeName: string;
  authorId: number;
  authorName: string;
}

export interface ResponseInfo {
  responseId: number;
  feedbackId: number;
  content: string;
  createdAt: string;
}

export interface ReportStatistics {
  totalDeliveries: number;
  totalFeedbackReceived: number;
  totalResponsesGiven: number;
  completedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
  averageResponseTimeHours: number;
}

export interface StudentReport {
  id: number;
  studentId: number;
  studentName: string;
  projectId: number;
  projectName: string;
  finalGrade: number;
  generatedAt: string;
  deliveries: DeliveryInfo[];
  feedbackReceived: FeedbackInfo[];
  responsesGiven: ResponseInfo[];
  statistics: ReportStatistics;
}

export const reportService = {
  /**
   * Genera un reporte estudiantil
   */
  async generateStudentReport(projectId: number, projectName: string, studentId: number): Promise<StudentReport> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/student-reports/generate`;
      const payload = {
        projectId,
        projectName
      };

      console.log('📝 [ReportService] Generating student report:', { url, payload, studentId });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'X-User-Id': String(studentId),
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [ReportService] Generate response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ReportService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [ReportService] Report generated:', data);
      return data;
    } catch (error) {
      console.error('❌ [ReportService] Error generating report:', error);
      throw error;
    }
  },

  /**
   * Descarga el PDF de un reporte
   */
  async downloadReportPDF(reportId: number, studentId: number, projectName: string): Promise<void> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/student-reports/${reportId}/pdf`;

      console.log('📥 [ReportService] Downloading report PDF:', { url, reportId, studentId });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'X-User-Id': String(studentId),
        },
      });

      console.log('📡 [ReportService] Download response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ReportService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Convertir la respuesta a blob
      const blob = await response.blob();
      
      // Crear un enlace temporal para descargar el archivo
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `reporte-${projectName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('✅ [ReportService] PDF downloaded successfully');
    } catch (error) {
      console.error('❌ [ReportService] Error downloading PDF:', error);
      throw error;
    }
  }
};
