package com.avatar.TiendaVirtualAvatarImprenta.entity.product;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
 //esta entidad solo se usa cuando los prodcutos tienen patrones de comercialización
//no por precio unitario
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product_commercial_quantity")
public class ProductCommercialQuantity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cantidad de comercialización del producto (ej: 6, 12, 18)
    // Cantidad siempre obligatoria en los patrones
    @Column(nullable = false)
    private Integer quantity; //ej; 6,12,18,

    //precio asociado a esa cantidad(ejem: $50, $200)
    // Precio siempre obligatorio en los patrones
    @Column(nullable = false)
    private BigDecimal price;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

}
