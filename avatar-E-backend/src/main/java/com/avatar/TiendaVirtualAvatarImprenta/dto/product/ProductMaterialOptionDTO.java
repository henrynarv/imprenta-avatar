package com.avatar.TiendaVirtualAvatarImprenta.dto.product;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para la relación producto-material con el precio adicional
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)


public class ProductMaterialOptionDTO {

    private Long id;
    private MaterialOptionDTO materialOptionDTO;
    private BigDecimal extraPrice = BigDecimal.ZERO;
}
