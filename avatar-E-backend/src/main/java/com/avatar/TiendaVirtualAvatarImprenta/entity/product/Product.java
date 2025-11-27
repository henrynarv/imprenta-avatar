package com.avatar.TiendaVirtualAvatarImprenta.entity.product;

import com.avatar.TiendaVirtualAvatarImprenta.enums.CommercializationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)//estrategia JOINED para herencia
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@SuperBuilder
@Table(name = "products")
public abstract class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; //Ej, "PF001" , "GLOSSY". "MATTE01"

    private String name;
    private String description;
    private String imageUrl;

    //tamaño en cm
    private String size;

    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    // Relación: un producto puede tener varios patrones de comercialización
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductCommercialQuantity> commercialQuantities = new ArrayList<>(); //cada producto puede tener varias cantidades>

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CommercializationType commercializationType = CommercializationType.PER_UNIT;

    /*@ManyToMany
    @JoinTable(
            name = "product_paper_finishes",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "paper_finish_id")
    )
    private List<MaterialOption>materialOptions = new ArrayList<>();*/

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductMaterialOption>materialOptions;


    @ManyToMany
    @JoinTable(
            name = "product_colors",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "color_id")
    )
    @Builder.Default
    private List<ColorOption> colorOptions = new ArrayList<>();


    // Producto siempre apunta a una subcategoría
    @ManyToOne
    @JoinColumn(name = "subcategory_id", nullable = false)
    private SubCategory subcategory;
}
