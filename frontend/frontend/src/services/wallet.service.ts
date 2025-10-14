import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://creative-communication-production.up.railway.app/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get or create user by wallet address
// export const fetchUserData = async (walletAddress: string) => {
//   try {
//     const response = await api.get(`/api/wallet/${walletAddress}`);
//     return response.data.data;
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     throw error;
//   }
// };

// // Update user's token balances
// export const updateUserTokens = async (walletAddress: string, tokens: any) => {
//   try {
//     const response = await api.put(`/api/wallet/${walletAddress}/tokens`, { tokens });
//     return response.data.data;
//   } catch (error) {
//     console.error('Error updating tokens:', error);
//     throw error;
//   }
// };

// // Apply referral code
// export const applyReferralCode = async (walletAddress: string, referralCode: string) => {
//   try {
//     const response = await api.post(`/api/wallet/${walletAddress}/referral`, { referralCode });
//     return response.data;
//   } catch (error) {
//     console.error('Error applying referral code:', error);
//     throw error;
//   }
// };

const walletService = {
  fetchUserData: async (walletAddress,login) => {
    try {
      const response = await api.post(`/api/wallet/${walletAddress}`,{ loginType:login });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  updateUserTokens: async (walletAddress, tokens) => {
    try {
      const response = await api.put(`/api/wallet/${walletAddress}/tokens`, { tokens });
      return response.data.data;
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  },

  applyReferralCode: async (walletAddress, referralCode) => {
    try {
      const response = await api.post(`/api/wallet/${walletAddress}/referral`, { referralCode });
      return response.data;
    } catch (error) {
      console.error('Error applying referral code:', error);
      throw error;
    }
  }
};
export default walletService
