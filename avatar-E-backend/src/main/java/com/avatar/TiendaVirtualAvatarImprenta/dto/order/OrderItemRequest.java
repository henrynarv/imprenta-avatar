package com.avatar.TiendaVirtualAvatarImprenta.dto.order;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderItemRequest {

    @NotNull(message = "El  producto es requerido")
    private Long productId;

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer quantity;//cantidad de producto

    @NotNull(message = "El precio unitario es requerido")
    private BigDecimal unitPrice = BigDecimal.ZERO;

}
