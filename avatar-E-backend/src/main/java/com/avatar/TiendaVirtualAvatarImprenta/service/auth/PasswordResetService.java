package com.avatar.TiendaVirtualAvatarImprenta.service.auth;

import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ApiResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ForgotPasswordRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ForgotPasswordResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ResetPasswordRequest;

public interface PasswordResetService {
    //void processForgotPassword(ForgotPasswordRequest request, String clientIp);
    ApiResponse<ForgotPasswordResponse> processForgotPassword(ForgotPasswordRequest request, String clientIp);
    void resetPassword(ResetPasswordRequest request);
    boolean validateToken(String token);
    void cleanupExpiredTokens();
    void cleanupExpiredAttempts();
}
