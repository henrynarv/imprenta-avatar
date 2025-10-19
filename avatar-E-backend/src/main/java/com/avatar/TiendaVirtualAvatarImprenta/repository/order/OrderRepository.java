package com.avatar.TiendaVirtualAvatarImprenta.repository.order;

import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderItemDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderSummaryDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.order.Order;
import com.avatar.TiendaVirtualAvatarImprenta.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT COUNT(o) FROM Order o WHERE YEAR(o.orderDate) = :year")
    long countOrdersByYear(@Param("year") int year);


    @Query("SELECT o FROM Order o " +
            "WHERE YEAR(o.orderDate) = :year  AND MONTH(o.orderDate) = :month")
    List<Order> findOrderByYearAndMonth(@Param("month") int month, @Param("year") int year);


    //query diario global(agrupado)
    @Query(
            value = """
            SELECT YEAR(o.orderDate) , MONTH(o.orderDate), DAY(o.orderDate), COUNT(o), SUM(o.totalAmount)
            FROM Order o
            WHERE o.orderDate BETWEEN :startDate AND :endDate
            AND (:status IS NULL OR o.status = :status)
            GROUP BY YEAR(o.orderDate), MONTH(o.orderDate), DAY(o.orderDate)
            ORDER BY YEAR(o.orderDate), MONTH(o.orderDate), DAY(o.orderDate)
            """,
            countQuery = """
                    SELECT COUNT(DISTINCT CONCAT(YEAR(o.orderDate),'-',MONTH(o.orderDate),'-',DAY(o.orderDate)))
                    FROM Order o
                    WHERE o.orderDate BETWEEN :startDate AND :endDate
                    AND (:status IS NULL OR o.status = :status)
                    """
    )
    Page<Object[]> getDailyReport(
            @Param("startDate")ZonedDateTime startDate,
            @Param("endDate") ZonedDateTime endDate,
            @Param("status") OrderStatus status,
            Pageable pageable
            );

    //query para filtrar por mes y status(global
    @Query(
            value = """
            SELECT YEAR(o.orderDate), MONTH(o.orderDate), COUNT(o) , SUM(o.totalAmount)
            FROM Order o
            WHERE o.orderDate BETWEEN :startDate AND :endDate
            AND (:status IS NULL OR o.status = :status)
            GROUP BY YEAR(o.orderDate), MONTH(o.orderDate)
            ORDER BY YEAR(o.orderDate), MONTH(o.orderDate)
            """,
            countQuery = """
                    SELECT COUNT(DISTINCT CONCAT(YEAR(o.orderDate),'-', MONTH(o.orderDate)))
                    FROM Order o
                    WHERE o.orderDate BETWEEN :startDate AND :endDate
                    AND (:status IS NULL OR o.status = :status)
                    """

    )
    Page<Object[]> getMonthlyReport(
            @Param("startDate") ZonedDateTime startDate,
            @Param("endDate") ZonedDateTime endDate,
            @Param("status") OrderStatus status,
            Pageable pageable
    );

    //query para filtrar por año y status(global)
    @Query(
            value = """
            SELECT  YEAR(o.orderDate), COUNT(o), SUM(o.totalAmount)
            FROM Order o
            WHERE o.orderDate BETWEEN :startDate AND :endDate
            AND (:status IS NULL OR o.status = :status)
            GROUP BY YEAR(o.orderDate)
            ORDER BY YEAR(o.orderDate)
            """,
            countQuery = """
            SELECT COUNT(DISTINCT YEAR(o.orderDate))
            FROM Order o
            WHERE o.orderDate BETWEEN :startDate AND :endDate
            AND (:status IS NULL OR o.status = :status)
            """

    )
    Page<Object[]> getYearlyReport(
            @Param("startDate") ZonedDateTime startDate,
            @Param("endDate") ZonedDateTime endDate,
            @Param("status") OrderStatus status,
            Pageable pageable
    );

    //query de todos las ordenes  por fecha y status
    @Query(
            value = """
      SELECT new com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderSummaryDTO(
          o.id, o.code, u.email, o.status, o.totalAmount)
      FROM Order o
      JOIN o.user u
      WHERE o.orderDate BETWEEN :startDate AND :endDate
      AND (:status IS NULL OR o.status = :status)
      AND (
      :searchText IS NULL OR
      LOWER(o.code) LIKE LOWER(CONCAT('%', :searchText,'%')) OR
      LOWER(u.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
      LOWER(o.status) LIKE LOWER(CONCAT('%', :searchText, '%'))
      )
      """,
            countQuery = """
      SELECT COUNT(o)
      FROM Order o
      JOIN o.user u
      WHERE o.orderDate BETWEEN :startDate AND :endDate
      AND (:status IS NULL OR o.status = :status)
      AND(
      :searchText IS NULL OR
      LOWER(o.code) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
      LOWER(u.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
      LOWER(o.status) LIKE LOWER(CONCAT('%', :searchText, '%'))
      )
      """
    )
    Page<OrderSummaryDTO> getOrdersInRange(
            @Param("startDate") ZonedDateTime startDate,
            @Param("endDate") ZonedDateTime endDate,
            @Param("status") OrderStatus status,
            @Param("searchText") String searchText,
            Pageable pageable);



    //dtealle de una orden especifica
    @Query("""
            SELECT new com.avatar.TiendaVirtualAvatarImprenta.dto.report.OrderItemDTO(
            p.name, o.quantity, i.price
            )
            FROM OrderItem o
            JOIN o.product p
            WHERE o.order.id = :orderId
            """)
    List<OrderItemDTO>findItemsByOrderId(@Param("orderId") Long orderId);
}
