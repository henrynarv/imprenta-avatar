package com.avatar.TiendaVirtualAvatarImprenta.service.auth;

import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ApiResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ForgotPasswordRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ForgotPasswordResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.auth.ResetPasswordRequest;
import com.avatar.TiendaVirtualAvatarImprenta.entity.auth.PasswordResetAttempt;
import com.avatar.TiendaVirtualAvatarImprenta.entity.auth.PasswordResetToken;
import com.avatar.TiendaVirtualAvatarImprenta.entity.user.User;
import com.avatar.TiendaVirtualAvatarImprenta.exception.BusinessException;
import com.avatar.TiendaVirtualAvatarImprenta.exception.ValidationException;
import com.avatar.TiendaVirtualAvatarImprenta.repository.auth.PasswordResetAttemptRepository;
import com.avatar.TiendaVirtualAvatarImprenta.repository.auth.PasswordResetTokenRepository;
import com.avatar.TiendaVirtualAvatarImprenta.repository.user.UserRepository;
import com.avatar.TiendaVirtualAvatarImprenta.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService{
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetAttemptRepository attemptRepository;


    @Value("${app.password-reset.token-expiration-hours:1}")
    private int tokenExpirationHours;

    @Value("${app.password-reset.max-attempts-per-hour:3}")
    private int maxAttemptsPerHour;

    /*@Value("${app.password-reset.cooldown-minutes:0}") // ✅ 2 minutos para testing
    private int cooldownMinutes;
*/

    //private final Set<String> processingEmails = ConcurrentHashMap.newKeySet();

    @Override
    @Transactional
    public ApiResponse<ForgotPasswordResponse> processForgotPassword(ForgotPasswordRequest request, String clientIp) {
        String email = request.getEmail().toLowerCase().trim();
        Instant now = Instant.now();

        /*
        // 🔒 Evita condiciones de carrera por email
        synchronized ((email + "_lock").intern()) {
            log.info("🔍 INICIANDO - Procesando forgot password para: {}, IP: {}", email, clientIp);

            // ⏳ Ventana de rate limit: 2 minutos
            Instant windowAgo = now.minus(Duration.ofMinutes(2));

            long tokensLastWindow = tokenRepository.countByUserEmailAndCreatedAtAfter(email, windowAgo);
            log.info("🔍 Tokens generados en últimos 2 minutos: {}/{}", tokensLastWindow, tokenExpirationHours);

            // 🚫 Si ya excedió el límite
            if (tokensLastWindow >= tokenExpirationHours) {
                log.warn("🚫 Rate limiting aplicado a {} - Tokens: {}", email, tokensLastWindow);

                Instant nextAttemptAllowed = now.plus(Duration.ofMinutes(2));

                ForgotPasswordResponse data =
                        ForgotPasswordResponse.rateLimited(email, nextAttemptAllowed);

                return ApiResponse.<ForgotPasswordResponse>builder()
                        .success(false)
                        .message("Has superado el límite de intentos. Podrás solicitar otro enlace en 2 minutos.")
                        .data(data)
                        .timestamp(now)
                        .build();
            }

            log.info("✅ No hay rate limiting, continuando...");

            // 🔍 Buscar usuario
            Optional<User> userOptional = userRepository
                    .findByEmailIgnoreCase(email)
                    .filter(User::getActive);

            // 📝 Registrar intento (auditoría)
            PasswordResetAttempt attempt = PasswordResetAttempt.builder()
                    .email(email)
                    .ipAddress(clientIp)
                    .attemptedAt(now)
                    .nextAttemptAllowed(now.plus(Duration.ofMinutes(2)))
                    .build();

            attemptRepository.save(attempt);

            // ▶ Continuar con el flujo normal
            return processValidForgotPassword(request, clientIp, userOptional);
        }

        */


        // ✅ BLOQUEO A NIVEL DE MÉTODO (synchronized por email)
        synchronized ((email + "_lock").intern()) {
            Instant now1 = Instant.now();
            log.info("🔍 INICIANDO - Procesando forgot password para: {}, IP: {}", email, clientIp);

            // ✅ 1. LIMPIAR INTENTOS EXPIRADOS
            //attemptRepository.deleteByNextAttemptAllowedBefore(now);

            // ✅ 2. CONTAR TOKENS GENERADOS EN ÚLTIMA HORA
            Instant oneHourAgo = now.minus(Duration.ofHours(1));
            long tokensLastHour = tokenRepository.countByUserEmailAndCreatedAtAfter(email, oneHourAgo);

            log.info("🔍 Tokens generados en última hora: {}/{}", tokensLastHour, maxAttemptsPerHour);

            // ✅ 3. VERIFICAR SI SUPERÓ EL LÍMITE (3 tokens por hora)
            if (tokensLastHour >= maxAttemptsPerHour) {
                log.warn("🚫 Rate limiting por límite horario: {} - Tokens: {}", email, tokensLastHour);


Instant firstToken = tokenRepository.findFirstTokenByUserEmailAfter(email, oneHourAgo)
                        .orElse(now);
                //Instant nextAttemptAllowed = firstToken.plus(Duration.ofHours(1));


                //1 hora desde AHORA (cálculo correcto):
                Instant nextAttemptAllowed = now.plus(Duration.ofHours(1));

                ForgotPasswordResponse data = ForgotPasswordResponse.rateLimited(email, nextAttemptAllowed);
                return ApiResponse.<ForgotPasswordResponse>builder()
                        .success(false)
                        .message("Has superado el límite de intentos. Podrás solicitar otro enlace en 1 hora.")
                        .data(data)
                        .timestamp(now)
                        .build();
            }

            log.info("✅ No hay rate limiting, procediendo con el procesamiento...");

            // ✅ 4. BUSCAR USUARIO
            Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email).filter(User::getActive);

            // ✅ 5. REGISTRAR NUEVO INTENTO (para auditoría)
            PasswordResetAttempt attempt = PasswordResetAttempt.builder()
                    .email(email)
                    .ipAddress(clientIp)
                    .attemptedAt(now)
                    .nextAttemptAllowed(now.plus(Duration.ofHours(24)))
                    .build();
            log.info("💾 Intentando guardar attempt en BD: email={}, ip={}", email, clientIp);
            PasswordResetAttempt savedAttempt = attemptRepository.save(attempt);
            log.info("✅ Attempt guardado en BD con ID: {}", savedAttempt.getId());

            // ✅ 6. PROCESAR (esto enviará 1 email)
            return processValidForgotPassword(request, clientIp, userOptional);
        }


        //TODO programcion imperativa y comun (es quivalente con el codigo que no esta conetado)
        /*String email = request.getEmail().toLowerCase().trim();

        validateRateLimit(email);
        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);

        if(userOptional.isPresent() && userOptional.get().getActive()){
            User user = userOptional.get();

            invalidatePreviousTokens(user);

            String token = generateUniqueToken();
            PasswordResetToken resetToken = createResetToken(user, token, clientIp);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
            log.info("Token de reset creado para usuario: {}", email);
        } else {
            // Por seguridad, mismo log pero no excepción
            log.info("Solicitud de reset para email no encontrado o inactivo: {}", email);
        }
*/

    }


    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if((!request.getNewPassword().equals(request.getConfirmPassword()))){
            throw  new ValidationException("Las contraseñas con coinciden");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BusinessException("Token inválido o expirado"));
    validateToken(resetToken);
    User user = userRepository.findByEmailAndActiveTrue(resetToken.getUser().getEmail())
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
    user.setPassword(passwordEncoder.encode(request.getConfirmPassword()));
    userRepository.save(user);

    resetToken.setUsed(true);
    tokenRepository.save(resetToken);
        log.info("Contraseña actualizada para usuario: {}", user.getEmail());

    }

    //verifica que el usuario no haya exedido el numero maximo de intentos por hora
    private void validateRateLimit(Long userId){
        Instant oneHourAgo = Instant.now().minus(Duration.ofHours(1));

        // Cuenta cuántas solicitudes de "forgot password" se hicieron en la última hora
        long recentAttempts =  tokenRepository.countRecentRequestsByUserId(userId,oneHourAgo);
        if(recentAttempts >= maxAttemptsPerHour){
            throw  new BusinessException("Demasiados intentos. Por favor espera una hora.");
        }
    }



    //MÉTODO PRIVADO PARA PROCESAR CUANDO TODO ESTÁ VÁLIDO
    private ApiResponse<ForgotPasswordResponse> processValidForgotPassword(
            ForgotPasswordRequest request, String clientIp, Optional<User> userOptional) {

        String email = request.getEmail().toLowerCase().trim();

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // ✅ 1. INVALIDAR TODOS LOS TOKENS ANTERIORES (IMPORTANTE!)
            invalidatePreviousTokens(user);

            // ✅ 2. GENERAR NUEVO TOKEN
            String token = generateUniqueToken();

            // ✅ 3. CREAR TOKEN (con IP real)
            PasswordResetToken resetToken = createResetToken(user, token, clientIp);

            // COMENTAR TEMPORALMENTE PARA TESTING
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
            log.info("✅ EMAIL SIMULADO - Token generado: {} para usuario: {}", token, email);

            ForgotPasswordResponse data = ForgotPasswordResponse.success(email);
            return ApiResponse.<ForgotPasswordResponse>builder()
                    .success(true)
                    .message("Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.")
                    .data(data)
                    .timestamp(Instant.now())
                    .build();

        } else {
            ForgotPasswordResponse data = ForgotPasswordResponse.userNotFound();
            return ApiResponse.<ForgotPasswordResponse>builder()
                    .success(true)
                    .message("Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.")
                    .data(data)
                    .timestamp(Instant.now())
                    .build();
        }
    }

    //Invalidar token anteriores
    //Invalidar token anteriores - DEBE funcionar
    private void invalidatePreviousTokens(User user){
        log.info("🔄 Invalidando tokens anteriores para usuario: {}", user.getEmail());
        int invalidated = tokenRepository.invalidateAllTokensByUser(user.getId());
        log.info("✅ Tokens invalidados: {}", invalidated);
    }
    //crear token de recuperación
    private PasswordResetToken createResetToken(User user, String token, String clientIp){
        PasswordResetToken resetToken  = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plus(Duration.ofHours(tokenExpirationHours)))
                .used(false)
                .createdAt(Instant.now())
                .ipAddress(clientIp)
                .build();

        return tokenRepository.save(resetToken);
    }

    //Validación del token
    private void validateToken(PasswordResetToken token){
        if(token.getUsed()){
            throw new BusinessException("El token ya ha sido utilizado.");
        }
        if(token.getExpiryDate().isBefore(Instant.now())){
            throw new BusinessException("El token ha expirado.");
        }
    }

    private String generateUniqueToken() {
        return UUID.randomUUID().toString();
    }
    @Override
    public boolean validateToken(String tokenValue) {
        return tokenRepository.findByToken(tokenValue)
                .filter( t-> !t.getUsed())
                .filter(t -> t.getExpiryDate().isAfter(Instant.now()))
                .isPresent();
    }

    @Override
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Limpiando tokens expirados...");
        tokenRepository.deleteExpiredTokens(Instant.now());
    }

    @Override

    @Scheduled(fixedRate = 3600000) // ✅ Cada hora
    @Transactional
    public void cleanupExpiredAttempts() {
        log.info("🔄 Limpiando intentos de reset expirados...");
        Instant now = Instant.now();

        // Limpiar por next_attempt_allowed
        int deletedByNextAttempt = attemptRepository.deleteByNextAttemptAllowedBefore(now);

        // Limpiar por attempted_at (más de 24 horas)
        Instant twentyFourHoursAgo = now.minus(Duration.ofHours(24));
        int deletedByAttemptedAt = attemptRepository.deleteByAttemptedAtBefore(twentyFourHoursAgo);

        if (deletedByNextAttempt > 0 || deletedByAttemptedAt > 0) {
            log.info("✅ Intentos limpiados - Por next_attempt: {}, Por attempted_at: {}",
                    deletedByNextAttempt, deletedByAttemptedAt);
        }
    }






    // EN PasswordResetServiceImpl - MÉTODO TEMPORAL PARA DEBUGGING
    private void debugDatabaseState(String email, Instant now) {
        log.info("🔍 === DEBUG DATABASE STATE ===");

        // Verificar intentos
        long attemptCount = attemptRepository.count();
        log.info("🔍 Total intentos en BD: {}", attemptCount);

        if (attemptCount > 0) {
            attemptRepository.findAll().forEach(att -> {
                boolean isExpired = att.getNextAttemptAllowed().isBefore(now);
                long secondsRemaining = java.time.Duration.between(now, att.getNextAttemptAllowed()).getSeconds();
                log.info("🔍 Intento - Email: {}, IP: {}, Creado: {}, NextAllowed: {}, Expired: {}, Segundos: {}",
                        att.getEmail(), att.getIpAddress(), att.getAttemptedAt(),
                        att.getNextAttemptAllowed(), isExpired, secondsRemaining);
            });
        }

        // Verificar tokens
        long tokenCount = tokenRepository.count();
        log.info("🔍 Total tokens en BD: {}", tokenCount);

        log.info("🔍 === FIN DEBUG ===");
    }
}
