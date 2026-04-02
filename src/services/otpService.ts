import { apiRequest, API_ENDPOINTS } from '@/config/api';

export interface SendOTPRequest {
  email: string;
  purpose?: 'booking' | 'registration' | 'password_reset';
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose?: 'booking' | 'registration' | 'password_reset';
}

export interface SendOTPResponse {
  otp_id: number;
  expires_in: number;
}

export interface VerifyOTPResponse {
  verified: boolean;
  email: string;
}

export const otpService = {
  /**
   * Send OTP to email
   */
  sendOTP: async (data: SendOTPRequest): Promise<{ success: boolean; message: string; data?: SendOTPResponse }> => {
    const result = await apiRequest<SendOTPResponse>(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (data: VerifyOTPRequest): Promise<{ success: boolean; message: string; data?: VerifyOTPResponse }> => {
    const result = await apiRequest<VerifyOTPResponse>(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result;
  },

  /**
   * Resend OTP
   */
  resendOTP: async (data: SendOTPRequest): Promise<{ success: boolean; message: string; data?: SendOTPResponse }> => {
    const result = await apiRequest<SendOTPResponse>(API_ENDPOINTS.RESEND_OTP, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result;
  }
};
