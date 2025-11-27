package com.avatar.TiendaVirtualAvatarImprenta.entity.auth;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Setter
@Getter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "password_reset_attempts")
//PasswordResetAttempt => Intento de restablecimiento de contraseña
public class PasswordResetAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "attempted_at",nullable = false)
    private Instant attemptedAt;// intentando en

    @Column(name = "next_attempt_allowed",nullable = false)
    private Instant nextAttemptAllowed; //próximo intento permitido

    //Método para verificar si está en cooldown OSEA TIEMPO DE ESPERA
    public boolean isInCooldown() {
        return Instant.now().isBefore(nextAttemptAllowed);
    }
}
