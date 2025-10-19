package com.avatar.TiendaVirtualAvatarImprenta.controller.report;

import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderDetailDTO;
import com.avatar.TiendaVirtualAvatarImprenta.enums.OrderStatus;
import com.avatar.TiendaVirtualAvatarImprenta.enums.ReportType;
import com.avatar.TiendaVirtualAvatarImprenta.service.report.OrderReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/reports/orders")
public class OrderReportController {

    /*
    // Controller
@GetMapping
public Page<?> getReport(
        @RequestParam ReportType type,
        @RequestParam ZonedDateTime startDate,
        @RequestParam ZonedDateTime endDate,
        @RequestParam(required = false) OrderStatus status,
        @PageableDefault(size = 10) Pageable pageable
) {
    return reportService.getReport(type, startDate, endDate, status, pageable);
}
    * */
    private final OrderReportService reportService;
    @GetMapping
    public Page<?> getReportByType(
            @RequestParam ReportType type,
            @RequestParam ZonedDateTime startDate,
            @RequestParam ZonedDateTime endDate,
            @RequestParam(required = false)OrderStatus status,
            @RequestParam(required = false) String searchText,
            @PageableDefault(size =10)Pageable pageable
            ){
        return reportService.getReport(type,startDate,endDate,status,searchText,pageable);
    }

    //detalle de la orden
    @GetMapping("/{id}")
    public OrderDetailDTO getOrderDetail(@PathVariable Long id){
        return reportService.getOrderDetail(id);
    }



}
