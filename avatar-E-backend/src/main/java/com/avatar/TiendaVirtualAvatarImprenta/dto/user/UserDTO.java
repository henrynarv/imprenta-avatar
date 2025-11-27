package com.avatar.TiendaVirtualAvatarImprenta.dto.user;

import com.avatar.TiendaVirtualAvatarImprenta.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDTO {

    //@NotNull(message = "El id de usuario es requerido")
    private Long id; // Solo presente en respuestas, no en creación

    @NotBlank(message = "La cédula es requerida")
    private String cedula;

    @NotBlank(message = "El nombre es requerido")
    private String firstName;

    @NotBlank(message = "El apellido es requerido")
    private String lastName;

    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo debe tener un formato valido")
    private String email;

    @NotBlank(message = "La teléfono es requerida")
    private String phoneNumber;

    @NotBlank(message = "La dirección es requerida")
    private String address;

    @NotBlank(message = "La comuna es requerida")
    private String comuna;

    @NotBlank(message = "La región es requerida")
    private String region;

    //Campos opcionale rapa empresa
    private String businessName; //razon social opcional

    private String rut;
    @Builder.Default
    private Boolean isBusiness = false;

    //Campo se solo lectura para respuesta
    @JsonIgnore
    private String fullName;
    public String getFullName() {
        return firstName + " " + lastName;
    }

    @NotNull(message = "El estado activo es requerido")
    @Builder.Default
    private Boolean active =true;

    @NotNull(message = "El rol es requerido")
    private UserRole role;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") // <-- formato con offset
    private OffsetDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime updatedAt;

}
