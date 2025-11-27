package com.avatar.TiendaVirtualAvatarImprenta.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateTokenRequest {
    @NotBlank(message = "El token es requerido")
    private String token;
}
