package com.avatar.TiendaVirtualAvatarImprenta.service.report;

import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderDetailDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderItemDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderReportDTO;
import com.avatar.TiendaVirtualAvatarImprenta.enums.OrderStatus;
import com.avatar.TiendaVirtualAvatarImprenta.enums.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.ZonedDateTime;

public interface OrderReportService {
    //genera un reporte segun el tipo solicitado(diario, mensual, anual, todos)
    Page<?> getReport(
            ReportType reportType,
            ZonedDateTime startDate,
            ZonedDateTime endDate,
            OrderStatus status,
            String searchText,
            Pageable pageable
    );

    OrderDetailDTO getOrderDetail(Long orderId);
}
