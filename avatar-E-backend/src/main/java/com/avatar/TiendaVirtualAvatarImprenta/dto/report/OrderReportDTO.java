package com.avatar.TiendaVirtualAvatarImprenta.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
//DTO para el reporte globales , duiarios , mensaules. anuales
public class OrderReportDTO {

    private String period;//Ejem: "2025-09-13" - "2025-09", "2025
    private Long totalOrders;//numero de ordenes
    private BigDecimal totalAmount = BigDecimal.ZERO;//Total de todas acumlados

}
