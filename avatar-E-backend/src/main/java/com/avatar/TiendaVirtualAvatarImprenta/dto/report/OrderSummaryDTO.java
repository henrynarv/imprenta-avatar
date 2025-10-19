package com.avatar.TiendaVirtualAvatarImprenta.dto.report;

import com.avatar.TiendaVirtualAvatarImprenta.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

// DTO para el  de la orden mostrando usuario, status, code, totalAmount de la orden
public class OrderSummaryDTO {

    private Long id;
    private String code;
    private String email;
    private OrderStatus status;
    private BigDecimal totalAmount = BigDecimal.ZERO;
}
