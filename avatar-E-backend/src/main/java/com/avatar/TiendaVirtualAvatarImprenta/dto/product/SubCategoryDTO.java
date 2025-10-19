package com.avatar.TiendaVirtualAvatarImprenta.dto.product;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubCategoryDTO {

    private Long id;

    @NotBlank(message = "El nombre de la subcategoria es requerido")
    private String name;

    @NotBlank(message = "El codigo de la subcategoria es requerido")
    private String code;

    //se usa en los request para indicar a que categoria pertenece
    @NotNull(message = "La categoria es requerida")
    private Long categoryId;

    //informacion para response
    //sierve para mostra el nombre de la categoria sin tener que hacer  hacer otra consulta
    private String categoryName;

    //lista de productos simplificada
    private List<ProductSummaryDTO> products;
}
