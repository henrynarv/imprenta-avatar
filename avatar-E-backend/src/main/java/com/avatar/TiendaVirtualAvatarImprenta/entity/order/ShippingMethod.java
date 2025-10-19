package com.avatar.TiendaVirtualAvatarImprenta.entity.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "shipping_method")
public class ShippingMethod { //tipo de envio
    //PICKUP, Retiro en tienda
    //DELIVERY,// Envío a domicilio
    //EXPRESS, // Envío express o especial
    //COURIER, // Delivery por courier

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String code;// ejem: PICKUP, DELIVERY, EXPRESS

    private String name; // ejem: Retiro en tienda, Envío a domicilio, Envío express o especial
    private String description; //Entrega rápida en 24h"

    private String courierInfo;// informacion del courier por donde se envia el pedido

    private BigDecimal cost = BigDecimal.ZERO; //precio de envio, puede se 0.0
}
