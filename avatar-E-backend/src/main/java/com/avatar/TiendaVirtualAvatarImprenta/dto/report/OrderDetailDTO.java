package com.avatar.TiendaVirtualAvatarImprenta.dto.report;

import com.avatar.TiendaVirtualAvatarImprenta.enums.OrderStatus;
import lombok.*;
import lombok.extern.java.Log;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
//detalle de la orden(dettael de la orden en el modal)
public class OrderDetailDTO {
    Long id;
    private String code;
    private String email;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private List<OrderItemDTO> items;
}
