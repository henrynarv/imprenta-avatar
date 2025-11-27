package com.avatar.TiendaVirtualAvatarImprenta.repository.auth;

import com.avatar.TiendaVirtualAvatarImprenta.entity.auth.PasswordResetAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetAttemptRepository extends JpaRepository<PasswordResetAttempt, Long> {

    //Buscar intento reciente por email o IP
    @Query(value = "SELECT * FROM password_reset_attempts a " +
        "WHERE (LOWER(a.email) = LOWER(:email) OR a.ip_address = :ipAddress) " +
            "AND a.next_attempt_allowed > :now " +
            "ORDER BY a.attempted_at DESC LIMIT 1",
            nativeQuery = true)
    Optional<PasswordResetAttempt> findRecentAttempt(@Param("email") String email,
                                                    @Param("ipAddress") String ipAddress,
                                                    @Param("now") Instant now);
    //Eliminar intentos con next_attempt_allowed expirado
    @Modifying
    @Query("DELETE FROM PasswordResetAttempt a WHERE a.nextAttemptAllowed < :cutoff")
    int deleteByNextAttemptAllowedBefore(@Param("cutoff") Instant cutoff);

    //limpiar intentos antiguos
    @Modifying
    @Query("DELETE FROM PasswordResetAttempt a WHERE a.attemptedAt < :cutoff")
    int deleteByAttemptedAtBefore(@Param("cutoff") Instant cutoff);

    // Contar intentos por email en un período
    @Query("SELECT COUNT(a) FROM PasswordResetAttempt a WHERE a.email = :email AND a.attemptedAt > :since")
    long countByEmailAndAttemptedAtAfter(@Param("email") String email, @Param("since") Instant since);

    // Encontrar el primer intento en un período
    @Query("SELECT MIN(t.createdAt) FROM PasswordResetToken t WHERE t.user.email = :email AND t.createdAt > :since")
    Optional<Instant> findFirstTokenByUserEmailAfter(@Param("email") String email, @Param("since") Instant since);


    @Modifying
    @Query("DELETE FROM PasswordResetAttempt a WHERE a.email = :email AND a.ipAddress = :ipAddress")
    int deleteByEmailAndIpAddress(@Param("email") String email, @Param("ipAddress") String ipAddress);
}
