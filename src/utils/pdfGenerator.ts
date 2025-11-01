import jsPDF from 'jspdf';
import { Project, Delivery, Report } from '@/types';

export const generateStudentReport = (project: Project, delivery: Delivery, studentName: string): string => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
        Reporte de Evaluación - ${project.name}
      </h1>
      
      <section style="margin: 30px 0;">
        <h2 style="color: #475569;">Información del Estudiante</h2>
        <p><strong>Nombre:</strong> ${studentName}</p>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </section>

      <section style="margin: 30px 0;">
        <h2 style="color: #475569;">Entrega: ${delivery.title}</h2>
        <p><strong>Descripción:</strong> ${delivery.description}</p>
        <p><strong>Fecha de entrega:</strong> ${new Date(delivery.dueDate).toLocaleDateString('es-ES')}</p>
        ${delivery.submittedAt ? `<p><strong>Enviado el:</strong> ${new Date(delivery.submittedAt).toLocaleDateString('es-ES')}</p>` : ''}
        ${delivery.grade ? `<p><strong>Calificación:</strong> ${delivery.grade}/100</p>` : ''}
      </section>

      <section style="margin: 30px 0;">
        <h2 style="color: #475569;">Retroalimentación del Profesor</h2>
        ${delivery.comments.length > 0 ? delivery.comments.map(comment => `
          <div style="background: #f1f5f9; padding: 15px; margin: 15px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>${comment.authorName}</strong> - ${new Date(comment.timestamp).toLocaleString('es-ES')}</p>
            <p style="margin: 0;">${comment.body}</p>
            ${comment.replies.length > 0 ? `
              <div style="margin-left: 20px; margin-top: 10px;">
                <p style="font-weight: bold; margin-bottom: 5px;">Respuestas:</p>
                ${comment.replies.map(reply => `
                  <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 4px;">
                    <p style="margin: 0 0 5px 0;"><strong>${reply.authorName}</strong> - ${new Date(reply.timestamp).toLocaleString('es-ES')}</p>
                    <p style="margin: 0;">${reply.body}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('') : '<p>No hay retroalimentación disponible.</p>'}
      </section>

      <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 12px;">
        <p>Sistema Académico - Reporte generado automáticamente</p>
      </footer>
    </div>
  `;

  return html;
};

export const generateTeamReport = (project: Project, professorName: string): string => {
  const totalDeliveries = project.deliveries.length;
  const submittedDeliveries = project.deliveries.filter(d => d.submittedAt).length;
  const averageGrade = project.deliveries
    .filter(d => d.grade)
    .reduce((sum, d) => sum + (d.grade || 0), 0) / (project.deliveries.filter(d => d.grade).length || 1);

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
        Reporte de Evaluación General - ${project.name}
      </h1>
      
      <section style="margin: 30px 0;">
        <h2 style="color: #475569;">Información del Curso</h2>
        <p><strong>Profesor:</strong> ${professorName}</p>
        <p><strong>Equipo:</strong> ${project.teamId}</p>
        <p><strong>Participantes:</strong> ${project.participants} estudiantes</p>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </section>

      <section style="margin: 30px 0;">
        <h2 style="color: #475569;">Estadísticas Generales</h2>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
          <p><strong>Total de entregas:</strong> ${totalDeliveries}</p>
          <p><strong>Entregas completadas:</strong> ${submittedDeliveries}</p>
          <p><strong>Promedio de calificación:</strong> ${averageGrade.toFixed(2)}/100</p>
        </div>
      </section>

      <section style="margin: 30px 0;">
        <h2 style="color: #475569;">Detalle de Entregas</h2>
        ${project.deliveries.map((delivery, index) => `
          <div style="background: #f8fafc; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin: 0 0 10px 0;">${index + 1}. ${delivery.title}</h3>
            <p><strong>Estado:</strong> ${delivery.submittedAt ? '✓ Entregado' : '⏱ Pendiente'}</p>
            ${delivery.grade ? `<p><strong>Calificación:</strong> ${delivery.grade}/100</p>` : ''}
            <p><strong>Comentarios:</strong> ${delivery.comments.length}</p>
          </div>
        `).join('')}
      </section>

      <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 12px;">
        <p>Sistema Académico - Reporte generado automáticamente</p>
      </footer>
    </div>
  `;

  return html;
};

export const downloadPDF = (html: string, filename: string) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Create a temporary div to render the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.style.width = '210mm'; // A4 width
  document.body.appendChild(temp);
  
  // Use html2canvas would be better, but for simplicity we'll use jsPDF's html method
  doc.html(temp, {
    callback: function (doc) {
      doc.save(filename);
      document.body.removeChild(temp);
    },
    x: 10,
    y: 10,
    width: 190,
    windowWidth: 800
  });
};

export const saveReport = (report: Omit<Report, 'id'>): Report => {
  const reports = JSON.parse(localStorage.getItem('academic_reports') || '[]');
  const newReport: Report = {
    ...report,
    id: `report-${Date.now()}`
  };
  reports.push(newReport);
  localStorage.setItem('academic_reports', JSON.stringify(reports));
  return newReport;
};
