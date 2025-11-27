package com.avatar.TiendaVirtualAvatarImprenta.controller.auth;

import com.avatar.TiendaVirtualAvatarImprenta.dto.user.AuthResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.LoginRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.RegisterRequest;
import com.avatar.TiendaVirtualAvatarImprenta.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest){
        log.info("Solicitud de regisstro recicbida para : {}", registerRequest.getEmail());

        AuthResponse response = authService.register(registerRequest);

        log.info("Registro completaddo exitosamente para : {}", registerRequest.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login (@Valid @RequestBody LoginRequest loginRequest){
        log.info("Solicitud de login recibida para : {}", loginRequest.getEmail());

        AuthResponse response = authService.login(loginRequest);

        log.info("Login completado exitosamente para : {}", loginRequest.getEmail());
        return ResponseEntity.ok(response);
    }

    //endpoint de verificación de salud
    @GetMapping("/health")
    public ResponseEntity<String> health(){
        return ResponseEntity.ok("Auth service esta ejecutandose");
    }
}
