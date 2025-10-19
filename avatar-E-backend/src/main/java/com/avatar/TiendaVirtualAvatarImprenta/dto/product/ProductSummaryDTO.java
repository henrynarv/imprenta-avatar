package com.avatar.TiendaVirtualAvatarImprenta.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
   - DTO simplificado de Producto.
   - Se usa únicamente cuando un producto se muestra como parte de otra entidad
   - (por ejemplo, en la lista de productos de una SubCategoría).
* */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryDTO {
    private Long id;
    private String code;
    private String name;

}
