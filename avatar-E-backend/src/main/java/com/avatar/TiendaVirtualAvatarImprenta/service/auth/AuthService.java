package com.avatar.TiendaVirtualAvatarImprenta.service.auth;

import com.avatar.TiendaVirtualAvatarImprenta.dto.user.AuthResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.LoginRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.RegisterRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.UserDTO;

import java.util.Optional;

public interface AuthService {
    AuthResponse register(RegisterRequest registerRequest);
    AuthResponse login (LoginRequest loginRequest);
    Optional<UserDTO> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCedula(String cedula);
}

