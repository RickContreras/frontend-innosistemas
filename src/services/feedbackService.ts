/**
 * Servicio para manejar las operaciones de retroalimentación y comentarios
 * Integración con el microservicio de Feedback
 */

const FEEDBACK_SERVICE_URL = import.meta.env.VITE_FEEDBACK_SERVICE_URL;

// Log de configuración
console.log('🔧 [FeedbackService] Configuración:', {
  FEEDBACK_SERVICE_URL,
  env: import.meta.env.VITE_FEEDBACK_SERVICE_URL
});

export interface FeedbackResponse {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  feedbackId: number;
  authorId: number;
  edited: boolean;
  deleted: boolean;
}

export interface Feedback {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  deliveryId: number;
  projectId: number | null;
  taskId: number | null;
  authorId: number;
  edited: boolean;
  deleted: boolean;
}

export interface FeedbackWithResponses {
  feedback: Feedback;
  responses: FeedbackResponse[];
}

export const feedbackService = {
  /**
   * Obtiene todos los feedbacks con sus respuestas para una entrega
   */
  async getFeedbacksWithResponses(deliveryId: number | string): Promise<FeedbackWithResponses[]> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/deliveries/${deliveryId}/feedbacks-with-responses`;
      console.log('🔍 [FeedbackService] Fetching feedbacks from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      console.log('📡 [FeedbackService] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FeedbackService] Feedbacks received:', data);
      console.log('📊 [FeedbackService] Number of feedbacks:', data.length);
      
      return data;
    } catch (error) {
      console.error('❌ [FeedbackService] Error fetching feedbacks:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo feedback para una entrega
   */
  async createFeedback(deliveryId: number | string, content: string, authorId: number, userRole: string = 'PROFESSOR'): Promise<Feedback> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/feedback`;
      const payload = {
        deliveryId: Number(deliveryId),
        content
      };

      console.log('📝 [FeedbackService] Creating feedback:', { url, payload, authorId, userRole });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Id': String(authorId),
          'X-User-Role': userRole,
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [FeedbackService] Create response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FeedbackService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FeedbackService] Feedback created:', data);
      return data;
    } catch (error) {
      console.error('❌ [FeedbackService] Error creating feedback:', error);
      throw error;
    }
  },

  /**
   * Actualiza un feedback existente
   */
  async updateFeedback(feedbackId: number, content: string): Promise<Feedback> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/feedback/${feedbackId}`;
      const payload = { content };

      console.log('✏️ [FeedbackService] Updating feedback:', { url, feedbackId, payload });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [FeedbackService] Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FeedbackService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FeedbackService] Feedback updated:', data);
      return data;
    } catch (error) {
      console.error('❌ [FeedbackService] Error updating feedback:', error);
      throw error;
    }
  },

  /**
   * Elimina un feedback
   */
  async deleteFeedback(feedbackId: number): Promise<void> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/feedback/${feedbackId}`;
      
      console.log('🗑️ [FeedbackService] Deleting feedback:', { url, feedbackId });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 [FeedbackService] Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FeedbackService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ [FeedbackService] Feedback deleted successfully');
    } catch (error) {
      console.error('❌ [FeedbackService] Error deleting feedback:', error);
      throw error;
    }
  },

  /**
   * Crea una respuesta a un feedback
   */
  async createResponse(feedbackId: number, content: string, authorId: number, userRole: string = 'STUDENT'): Promise<FeedbackResponse> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/feedback/${feedbackId}/responses`;
      const payload = { content };

      console.log('💬 [FeedbackService] Creating response:', { url, feedbackId, payload, authorId, userRole });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Id': String(authorId),
          'X-User-Role': userRole,
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [FeedbackService] Response create status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FeedbackService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FeedbackService] Response created:', data);
      return data;
    } catch (error) {
      console.error('❌ [FeedbackService] Error creating response:', error);
      throw error;
    }
  },

  /**
   * Actualiza una respuesta existente
   */
  async updateResponse(responseId: number, content: string): Promise<FeedbackResponse> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/response/${responseId}`;
      const payload = { content };

      console.log('✏️ [FeedbackService] Updating response:', { url, responseId, payload });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [FeedbackService] Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FeedbackService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FeedbackService] Response updated:', data);
      return data;
    } catch (error) {
      console.error('❌ [FeedbackService] Error updating response:', error);
      throw error;
    }
  },

  /**
   * Elimina una respuesta
   */
  async deleteResponse(responseId: number): Promise<void> {
    try {
      const url = `${FEEDBACK_SERVICE_URL}/api/v1/response/${responseId}`;
      
      console.log('🗑️ [FeedbackService] Deleting response:', { url, responseId });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 [FeedbackService] Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FeedbackService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ [FeedbackService] Response deleted successfully');
    } catch (error) {
      console.error('❌ [FeedbackService] Error deleting response:', error);
      throw error;
    }
  },
};
