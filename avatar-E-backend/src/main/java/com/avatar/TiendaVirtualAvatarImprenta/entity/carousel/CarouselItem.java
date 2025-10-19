package com.avatar.TiendaVirtualAvatarImprenta.entity.carousel;

import com.avatar.TiendaVirtualAvatarImprenta.entity.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "carousel_items")
public class CarouselItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String imageUrl;
    private String ButtonText;//texto del boton(ejem: "ver mas" , "comprar")
    private int orderIndex;//posisicion del banner en el slider
    private boolean active = true; //activasr odesactivar el banner

    //relacin con el producto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
}
