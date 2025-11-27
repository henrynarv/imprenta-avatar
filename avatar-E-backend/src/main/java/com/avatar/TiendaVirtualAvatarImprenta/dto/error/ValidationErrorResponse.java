package com.avatar.TiendaVirtualAvatarImprenta.dto.error;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class ValidationErrorResponse {

    private int status;
    private String message;
    private Instant timestamp;
    private Map<String, List<String>> errors;
}
