package com.avatar.TiendaVirtualAvatarImprenta.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ForgotPasswordResponse {
    private Boolean emailSent;
    private String email;
    private Instant nextAttemptAllowed;
    private Long remainingTimeSeconds;

    //metodo factory;
    public static ForgotPasswordResponse success(String email) {
     return ForgotPasswordResponse.builder()
             .emailSent(true)
             .email(email)
             .nextAttemptAllowed(null)      //EXPLÍCITAMENTE null
             .remainingTimeSeconds(null)    //EXPLÍCITAMENTE null
             .build();
    }

    public static ForgotPasswordResponse rateLimited    (String email, Instant nextAttemptAllowed) {
        long remainingSeconds = Duration.between(Instant.now(), nextAttemptAllowed).getSeconds();
        remainingSeconds = Math.max(0,remainingSeconds);
        return ForgotPasswordResponse
                .builder()
                .emailSent(false)
                .email(email)
                .nextAttemptAllowed(nextAttemptAllowed)
                .remainingTimeSeconds(remainingSeconds)
                .build();
    }

    public static ForgotPasswordResponse userNotFound() {
        return ForgotPasswordResponse.builder()
                .emailSent(false)
                .email(null)                   // EXPLÍCITAMENTE null
                .remainingTimeSeconds(null)    // EXPLÍCITAMENTE null
                .nextAttemptAllowed(null)      // EXPLÍCITAMENTE null
                .build();

    }
}
