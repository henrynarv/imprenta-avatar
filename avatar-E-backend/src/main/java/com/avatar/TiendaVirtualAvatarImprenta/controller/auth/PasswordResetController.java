package com.avatar.TiendaVirtualAvatarImprenta.controller.auth;

import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.*;
import com.avatar.TiendaVirtualAvatarImprenta.exception.BusinessException;
import com.avatar.TiendaVirtualAvatarImprenta.service.auth.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class PasswordResetController {
    private final PasswordResetService passwordResetService;
    @PostMapping("/forgot-password")
    ResponseEntity<ApiResponse<ForgotPasswordResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        log.info("Solicitud de restablecimiento de contraseña recibida para : {}", request.getEmail());
        String clientIp = getClientIpAddress(httpRequest);
        //passwordResetService.processForgotPassword(request, clientIp);
        //Siempre retornar éxito por seguridad (no revelar si email existe)
        ApiResponse<ForgotPasswordResponse> response  = passwordResetService.processForgotPassword(request, clientIp);
        log.info("Solicitud de restablecimiento procesada  para : {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("intentando restablecer contraseña con token");
        passwordResetService.resetPassword(request);

        ApiResponse response = ApiResponse.success(
                "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
        );
        log.info("Contraeña Restablecida exitosamente");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-reset-token")
    ResponseEntity<ApiResponse> validateResetToken(@Valid @RequestBody ValidateTokenRequest request) {
        log.info("Validando token de restableciminto: {}", request.getToken());
        boolean isValid = passwordResetService.validateToken(request.getToken());
        if(!isValid) {
            throw  new BusinessException("token inválido o expirado");
        }
            return ResponseEntity.ok(ApiResponse.success("Token valido"));
    }

    //Obtiene la IP real del clinete (Considerando proxies)
    private String getClientIpAddress(HttpServletRequest request){
        String xForwardedFor = request.getHeader("x-Forwarded-For");
        if(xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)){
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader(("x-Real-Ip"));
        if(xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        String ip = request.getRemoteAddr();
        // Convertir IPv6 localhost a IPv4
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip;
    }
}
