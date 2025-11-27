package com.avatar.TiendaVirtualAvatarImprenta.service.auth;

import com.avatar.TiendaVirtualAvatarImprenta.config.user.UserMapper;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.AuthResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.LoginRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.RegisterRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.UserDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.user.User;
import com.avatar.TiendaVirtualAvatarImprenta.exception.BusinessException;
import com.avatar.TiendaVirtualAvatarImprenta.exception.ValidationException;
import com.avatar.TiendaVirtualAvatarImprenta.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl  implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("Intentando registra usuario: {}", registerRequest.getEmail());

        //Validar que las contraseñas coincidan
        if(!registerRequest.isPasswordMatching()){
            throw new ValidationException("Las contraseñas no coinciden");
        }

        //Validar email unico
        if(existsByEmail(registerRequest.getEmail())){
            throw new BusinessException("El email ya esta registrado", HttpStatus.CONFLICT);
        }

        //Validar cedula unica
        if(existsByCedula(registerRequest.getCedula())){
            throw new BusinessException("La cédula ya está registrada", HttpStatus.CONFLICT);
        }

        //mapear y guardar usuario
        User user = userMapper.toEntity(registerRequest);
        User savedUser = userRepository.save(user);

        log.info("Usuario registrado con exito: {}", savedUser.getId());

        return userMapper.toAuthResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Intentando loguear usuario: {}", loginRequest.getEmail());

        //buscar usuario activo
        User user = userRepository.findByEmailAndActiveTrue(loginRequest.getEmail())
                .orElseThrow(() -> new BusinessException("Credenciales inválidas", HttpStatus.UNAUTHORIZED));

        //Validar contraseña
        if(!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
            throw new BusinessException("Credenciales inválidas", HttpStatus.UNAUTHORIZED);
        }
        log.info("Login exitoso para usuario: {}", user.getEmail());
        return userMapper.toAuthResponse(user);
    }

    @Override
    public Optional<UserDTO> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(userMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return  userRepository.existsByEmailIgnoreCase(email);
    }

    @Override
    public boolean existsByCedula(String cedula) {
        return userRepository.existsByCedula(cedula);
    }
}
