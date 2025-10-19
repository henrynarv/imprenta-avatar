package com.avatar.TiendaVirtualAvatarImprenta.entity.product;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entidad intermedia que relaciona un Producto con un Material específico
 * y guarda el precio adicional que ese material agrega al producto.
 */

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "product_material_options")
public class ProductMaterialOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_option_id", nullable = false)
    private MaterialOption materialOption;//vinil, couche, papel

    //precio adicional para ese tipo de material
    private BigDecimal extraPrice = BigDecimal.ZERO;

}
