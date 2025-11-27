package com.avatar.TiendaVirtualAvatarImprenta.repository.auth;

import com.avatar.TiendaVirtualAvatarImprenta.entity.auth.PasswordResetToken;
import com.avatar.TiendaVirtualAvatarImprenta.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    //Buscar por usuario y que el campo ‘used’ sea falso
    Optional<PasswordResetToken> findByUserAndUsedFalse(User user);

    //Invalida TODAS las solicitudes previas del usuario (operación atómica)
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user.id = :userId AND t.used = false")
    int invalidateAllTokensByUser(@Param("userId") Long userId);
    @Modifying
    @Query("DELETE FROM PasswordResetToken  t WHERE t.expiryDate < :now")
    void deleteExpiredTokens(@Param("now")Instant now);

    @Query("SELECT COUNT(t) FROM PasswordResetToken t WHERE t.user.id = :userId AND t.createdAt > :since")
    Long countRecentRequestsByUserId(@Param("userId") Long userId, @Param("since") Instant since);


    // En PasswordResetTokenRepository
    @Query("SELECT MAX(t.createdAt) FROM PasswordResetToken t WHERE t.user.id = :userId")
    Optional<Instant> findLastAttemptByUserId(@Param("userId") Long userId);

    // En PasswordResetTokenRepository - AGREGAR:
    @Query("SELECT COUNT(t) FROM PasswordResetToken t WHERE t.user.email = :email AND t.createdAt > :since")
    long countByUserEmailAndCreatedAtAfter(@Param("email") String email, @Param("since") Instant since);

    @Query("SELECT MIN(t.createdAt) FROM PasswordResetToken t WHERE t.user.email = :email AND t.createdAt > :since")
    Optional<Instant> findFirstTokenByUserEmailAfter(@Param("email") String email, @Param("since") Instant since);
}
