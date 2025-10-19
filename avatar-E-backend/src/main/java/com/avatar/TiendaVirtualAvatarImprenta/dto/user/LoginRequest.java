package com.avatar.TiendaVirtualAvatarImprenta.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "El correo es requerido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;
}
