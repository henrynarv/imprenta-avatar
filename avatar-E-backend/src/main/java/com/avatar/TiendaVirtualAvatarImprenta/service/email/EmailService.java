package com.avatar.TiendaVirtualAvatarImprenta.service.email;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String userName, String resetToken);
    void sendWelcomeEmail(String toEmail, String userName);
}
