package com.avatar.TiendaVirtualAvatarImprenta.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "La cédula es requerida")
    private String cedula;

    @NotBlank(message = "El nombre es requerido")
    private String firstName;

    @NotBlank(message = "El apellido es requerido")
    private String lastName;

    @Email(message = "El correo debe tener un formato valido")
    @NotBlank(message = "El correo es requerido")
    private String email;

    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @NotBlank(message = "La contraseña es requerida")
    private String password;

    @NotBlank(message = "La confirmación de la contraseña es requerida")
    private String confirmPassword;

    @NotBlank(message = "El teléfono es requerido")
    private String phoneNumber;

    @NotBlank(message = "La dirección es requerida")
    private String address;

    @NotBlank(message = "La comuna es requerida")
    private String comuna;

    @NotBlank(message = "La región es requerida")
    private String region;

    //Campos opcionales
    private String businessName;//Razón social

    private String rut;

    @Builder.Default
    private Boolean isBusiness = false;

    //metodo validacion , Mtach entre password
    public boolean isPasswordMatching(){
        return password != null && password.equals(confirmPassword);
    }
}
