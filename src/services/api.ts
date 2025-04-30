
import axios from 'axios';

// API base URL
const API_URL = 'https://api.example.com'; // Replace with your actual API URL

export const distributionApi = {
  // Register manual distribution (medication, diapers, beneficiary)
  registerManualDistribution: async (type: 'medication' | 'diapers' | 'beneficiary', userId: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/distribution/manual`, {
        type,
        userId
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to register ${type} distribution:`, error);
      throw error;
    }
  },

  // Get beneficiary by ID (from QR code)
  getBeneficiary: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/beneficiaries/${id}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get beneficiary:', error);
      throw error;
    }
  },

  // Confirm meal distribution
  confirmMeal: async (beneficiaryId: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/meals/scan`, {
        beneficiaryId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to confirm meal:', error);
      throw error;
    }
  },

  // Register distribution
  registerDistribution: async (data: {
    beneficiaryId: string;
    userId: string;
    medicationReceived?: boolean;
    diapersReceived?: boolean;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/api/distribution`, {
        ...data,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to register distribution:', error);
      throw error;
    }
  }
};
