
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default class APIService {
    /**
     * Check API health status
     */
    static async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Get API information
     */
    static async getInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/info`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Predict eagle from audio file
     * @param {File} audioFile - The audio file to analyze
     */
    static async predictFromFile(audioFile: File) {
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);

            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Prediction failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message || 'Failed to connect to server'
            };
        }
    }
}