package com.avatar.TiendaVirtualAvatarImprenta.service.email;

import com.avatar.TiendaVirtualAvatarImprenta.enums.EmailErrorType;
import com.avatar.TiendaVirtualAvatarImprenta.exception.EmailException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Year;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService{

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Override
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        try {
          //Validación básica
          if(toEmail == null || toEmail.trim().isEmpty()){
              throw  new EmailException("Email del destinatario es inválido",toEmail, EmailErrorType.INVALID_RECIPIENT);
          }
            String resetLink = "http://localhost:4200/auth/reset-password?token=" + resetToken;

            Context context  = new Context();
            context.setVariable("userName", userName);
            context.setVariable("resetLink", resetLink);
            //no es correo del remitente, se usa en la plantilla como informacion
            /*context.setVariable("supportEmail", "soporte@imprentaavatar.cl");*/

            //Procesar plantilla
            String htmlContent;
            try {
                htmlContent = templateEngine.process("password-reset", context);
            }
            catch (Exception e){
                log.error("Error al procesar la plantilla para {}", toEmail, e);
                throw new EmailException(
                        "Error al procesar la plantilla del email " + e.getMessage(),
                        toEmail,
                        EmailErrorType.TEMPLATE_PROCESSING_ERROR,
                        e
                );
            }
            //Enviar correo
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Restablecer Contraseña");
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email de recuperación enviado con exito a {}", toEmail);
        }catch (MessagingException e){
            log.error("Error de mensajeria enviando email a : {}", toEmail,e);
            throw  new EmailException(
                    "Error enviando email: "+e.getMessage(),
                    toEmail,
                    EmailErrorType.SEND_FAILURE,
                    e
            );
        }
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            // Validación básica
            if (toEmail == null || toEmail.trim().isEmpty()) {
                throw new EmailException("Email del destinatario es inválido", toEmail, EmailErrorType.INVALID_RECIPIENT);
            }

            // Preparar contexto para la plantilla
            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("welcomeMessage", "¡Bienvenido a Imprenta Avatar!");
            context.setVariable("supportEmail", "soporte@imprentaavatar.cl");
            context.setVariable("websiteUrl", "http://localhost:4200");

            // Procesar plantilla HTML
            String htmlContent;
            try {
                htmlContent = templateEngine.process("templates/email/welcome", context);
            } catch (Exception e) {
                log.error("Error al procesar la plantilla de bienvenida para: {}", toEmail, e);
                throw new EmailException(
                        "Error al procesar la plantilla de bienvenida: " + e.getMessage(),
                        toEmail,
                        EmailErrorType.TEMPLATE_PROCESSING_ERROR,
                        e
                );
            }

            // Crear y enviar email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("¡Bienvenido a Imprenta Avatar!");
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            log.info("✅ Email de bienvenida enviado exitosamente a: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Error de mensajería enviando email de bienvenida a: {}", toEmail, e);
            throw new EmailException(
                    "Error enviando email de bienvenida: " + e.getMessage(),
                    toEmail,
                    EmailErrorType.SEND_FAILURE,
                    e
            );
        }
    }
}
