package com.avatar.TiendaVirtualAvatarImprenta.entity.order;

import com.avatar.TiendaVirtualAvatarImprenta.entity.user.User;
import com.avatar.TiendaVirtualAvatarImprenta.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(name = "order_date")
    private ZonedDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status; // PAID, PENDING, SHIPPED ,etc

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_method_id")
    private ShippingMethod shippingMethod;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    //metodo de utilidad: generarr codigo de la orden
    public void generateCode(int orderNumberForYear) {
        int year = this.orderDate.getYear();
        this.code = String.format("ORD-%d-%05d",year, orderNumberForYear);
    }



}
