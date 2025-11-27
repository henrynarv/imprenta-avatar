package com.avatar.TiendaVirtualAvatarImprenta.entity.product;

import com.avatar.TiendaVirtualAvatarImprenta.common.Auditable;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "subcategories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCategory extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(unique = true, nullable = false)
    private String code;

    //relacin con la caregoria padre
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    //relacion con los productos
    @OneToMany(mappedBy = "subcategory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product> products;

    @Override
    public String toString() {
        return "SubCategory{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category=" + category +
                '}';
    }
}
