package com.avatar.TiendaVirtualAvatarImprenta.service.report;

import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderDetailDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderItemDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderReportDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderSummaryDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.order.Order;
import com.avatar.TiendaVirtualAvatarImprenta.enums.OrderStatus;
import com.avatar.TiendaVirtualAvatarImprenta.enums.ReportType;
import com.avatar.TiendaVirtualAvatarImprenta.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderReportServiceImpl implements OrderReportService {

    private final OrderRepository orderRepository;

    @Override
    public Page<?> getReport(ReportType reportType, ZonedDateTime startDate, ZonedDateTime endDate, OrderStatus status, String searchText,Pageable pageable) {
        //si viene vacio tratalo como null
        if(searchText != null && searchText.trim().isEmpty()){
            searchText = null;
        }
        return switch (reportType){
            case DAILY ->{
                Page<Object[]> result = orderRepository.getDailyReport(startDate,endDate,status,pageable);
                yield result.map(this::mapDailyRow);
            }
            case ALL -> orderRepository.getOrdersInRange(startDate,endDate,status,searchText,pageable);
            case MONTHLY -> {
                Page<Object[]> result = orderRepository.getMonthlyReport(startDate,endDate,status,pageable);
                yield result.map(this::mapMonthlyRow);
            }
            case YEARLY -> {
                Page<Object[]> result = orderRepository.getYearlyReport(startDate,endDate,status,pageable);
                yield result.map(this:: mapYearlyRow);
            }

            default -> Page.empty(pageable);

        };

    }

    @Override
    public OrderDetailDTO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        List<OrderItemDTO> items = orderRepository.findItemsByOrderId(orderId);
        return OrderDetailDTO.builder()
                .id(order.getId())
                .code(order.getCode())
                .email(order.getUser().getEmail())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(items)
                .build();

    }

    private OrderReportDTO mapDailyRow(Object[] row) {
        Number year = (Number) row[0];
        Number month = (Number) row[1];
        Number day = (Number) row[2];
        Number count = (Number) row[3];
        BigDecimal sum = (BigDecimal) row[4];

        String period = String.format("%d-%02d-%02d",
                year != null ? year.intValue() : 0,
                month != null ? month.intValue() : 0,
                day != null ? day.intValue() : 0
        );

        long totalOrders = count != null ? count.longValue() : 0L;
        BigDecimal totalAmount = sum != null ? sum : BigDecimal.ZERO;
        return new OrderReportDTO(period,totalOrders,totalAmount);
    }

    //mapear para MONTHLY
    private OrderReportDTO mapMonthlyRow(Object[] row){
        Number year  = (Number) row[0];
        Number month = (Number) row[1];
        Number count = (Number) row[2];
        BigDecimal sum = (BigDecimal) row[3];

        String period = String.format("%d-%02d",
                year != null ? year.intValue() :0,
                month != null ? month.intValue(): 0
                );

        long totalOrders = count != null ? count.longValue(): 0L;
        BigDecimal totalAmount = sum != null ? sum : BigDecimal.ZERO;

        return new OrderReportDTO(period,totalOrders,totalAmount);
    }

    private OrderReportDTO mapYearlyRow(Object[] row){
        Number year = (Number) row[0];
        Number count = (Number) row[1];
        BigDecimal sum = (BigDecimal) row[2];

        String period = year != null ? year.toString() : "0";
        long totalOrders = count != null ? count.longValue() : 0L;
        BigDecimal totalAmount = sum != null ? sum : BigDecimal.ZERO;

        return new OrderReportDTO(period,totalOrders,totalAmount);

    }



    /*
    return switch (reportType) {
            case DAILY -> {
                Page<Object[]> result = orderRepository.getDailyReport(startDate, endDate, status, pageable);
                yield result.map(this::mapDailyRow);
            }

       // 🔹 Mapper para DAILY
    private OrderReportDTO mapDailyRow(Object[] row) {
        Number year = (Number) row[0];
        Number month = (Number) row[1];
        Number day = (Number) row[2];
        Number count = (Number) row[3];
        BigDecimal sum = (BigDecimal) row[4];

        String period = String.format("%d-%02d-%02d",
                year != null ? year.intValue() : 0,
                month != null ? month.intValue() : 0,
                day != null ? day.intValue() : 0
        );

        long totalOrders = count != null ? count.longValue() : 0L;
        BigDecimal totalAmount = sum != null ? sum : BigDecimal.ZERO;

        return new OrderReportDTO(period, totalOrders, totalAmount);
    }


    * */
}
