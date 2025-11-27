package com.avatar.TiendaVirtualAvatarImprenta.entity.auth;

import com.avatar.TiendaVirtualAvatarImprenta.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

/*
    @Column(nullable = false)
    private String email;
*/

    @Column(name = "expiry_date",nullable = false)
    private Instant expiryDate;

    @Builder.Default
    private Boolean used = false;

    @Column(name = "created_at",nullable = false)
    private Instant createdAt;

    @Column(name = "ip_address")
    private String ipAddress;
}
