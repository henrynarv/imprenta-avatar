package com.avatar.TiendaVirtualAvatarImprenta.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private String productName;
    private Integer quantity;
    private BigDecimal price;

}
