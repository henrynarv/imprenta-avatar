package com.avatar.TiendaVirtualAvatarImprenta.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

//ESTA CLAE SOLO MANEJA RESPUESTAS DE EXITO ; ERROR RESPONSE
//TIENE SU CLASE Y TRABABA CON @ControllerAdvice QUE S UN MAJEAODR DE EXCEPIONES GLOBAL
//ESTA ES LA CLASE QUE MANEJA EXOCEPCIONES GLOBAL GlobalExceptionHandler
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private Instant timestamp;
    private T data;

    public static ApiResponse<Void> success(String message){
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }


    // Respuesta con data
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .timestamp(Instant.now())
                .data(data)
                .build();
    }

    // ⚡ Aquí agregas el método para retornar la hora de Chile
    @JsonProperty("timestamp_chile")
    public String getTimestampChile() {
        if (timestamp == null) return null;

        return ZonedDateTime
                .ofInstant(timestamp, ZoneId.of("America/Santiago"))
                .toString();
    }

}
