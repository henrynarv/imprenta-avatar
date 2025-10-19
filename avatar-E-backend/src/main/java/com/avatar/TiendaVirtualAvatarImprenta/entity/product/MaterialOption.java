package com.avatar.TiendaVirtualAvatarImprenta.entity.product;

import jakarta.persistence.*;
import lombok.*;
/**
 * Entidad que representa un tipo de material genérico
 * Ej: "Vinilo", "Couché", "Papel bond"
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "material_options")
//acabado de papel
public class MaterialOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;//ejem COUCHE, VINILO

    @Column(unique = true, nullable = false)
    private String name;//NOmbre del acabado (ej: couche, vinilo, carton)
}
