/**
 * Servicio para manejar las operaciones de retroalimentación y comentarios
 * Integración con el microservicio de Feedback
 */

const FEEDBACK_SERVICE_URL = import.meta.env.VITE_FEEDBACK_SERVICE_URL;

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
      const response = await fetch(
        `${FEEDBACK_SERVICE_URL}/api/v1/deliveries/${deliveryId}/feedbacks-with-responses`,
        {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo feedback para una entrega
   */
  async createFeedback(deliveryId: number | string, content: string, authorId: number): Promise<Feedback> {
    try {
      const response = await fetch(
        `${FEEDBACK_SERVICE_URL}/api/v1/deliveries/${deliveryId}/feedbacks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify({
            content,
            authorId,
            deliveryId: Number(deliveryId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  /**
   * Actualiza un feedback existente
   */
  async updateFeedback(feedbackId: number, content: string): Promise<Feedback> {
    try {
      const response = await fetch(
        `${FEEDBACK_SERVICE_URL}/api/v1/feedbacks/${feedbackId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  /**
   * Elimina un feedback
   */
  async deleteFeedback(feedbackId: number): Promise<void> {
    try {
      const response = await fetch(
        `${FEEDBACK_SERVICE_URL}/api/v1/feedbacks/${feedbackId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },

  /**
   * Crea una respuesta a un feedback
   */
  async createResponse(feedbackId: number, content: string, authorId: number): Promise<FeedbackResponse> {
    try {
      const response = await fetch(
        `${FEEDBACK_SERVICE_URL}/api/v1/feedbacks/${feedbackId}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify({
            content,
            authorId,
            feedbackId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating response:', error);
      throw error;
    }
  },

  /**
   * Actualiza una respuesta existente
   */
  async updateResponse(responseId: number, content: string): Promise<FeedbackResponse> {
    try {
      const response = await fetch(
        `${FEEDBACK_SERVICE_URL}/api/v1/responses/${responseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating response:', error);
      throw error;
    }
  },

  /**
   * Elimina una respuesta
   */
  async deleteResponse(responseId: number): Promise<void> {
    try {
      const response = await fetch(
        `${FEEDBACK_SERVICE_URL}/api/v1/responses/${responseId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting response:', error);
      throw error;
    }
  },
};
