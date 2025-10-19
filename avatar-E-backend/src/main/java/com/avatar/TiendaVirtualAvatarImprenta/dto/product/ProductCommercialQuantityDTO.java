package com.avatar.TiendaVirtualAvatarImprenta.dto.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductCommercialQuantityDTO {

    private Long id;
    @NotNull(message = "La cantidad es requerida")
    @Min(value = 1, message = "La cantidad debe ser mayor que 0")
    private Integer quantity;//cantidad(ejem: 100, 500, 1000)

    @NotNull(message = "El precio es requerido")
    @DecimalMin(value = "0.01" , message = "El precio debe ser mayor que 0")
    private BigDecimal price;//precio asociado a la cantidad
}
