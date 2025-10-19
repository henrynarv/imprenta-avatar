package com.avatar.TiendaVirtualAvatarImprenta.dto.product;

import com.avatar.TiendaVirtualAvatarImprenta.enums.CommercializationType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductDTO {

    //CAMPOS COMÚNES(request y response)
    private Long id;

    @NotBlank(message = "El codigo de producto es requerido")
    private String code;

    @NotBlank(message = "El nombre es requerido")
    private String name;

    private String description;

    @NotNull(message = "La imagen es requerida")
    private String imageUrl;

    @NotNull(message = "El tamaño de producto es requerido")
    private String size;

    @NotNull(message = "El precio es requerido")
    private BigDecimal price;

    //Materiales asignados al producto con precio extra
    private List<ProductMaterialOptionDTO> materialOptions;

    //Colores asignados al producto
    private List<ColorOptionDTO> colorOptions;

    //CAMPOS RELACIONADOS(response)
    //Nombre de la subcategoria
    private String subcategoryName;
    //Opciones de materia(solo nombre para mostrar en el frontend)
    private List<String> materialOptionsNames;
    //Opciones de color(solo nombre para mostrar em el frontend)
    private List<String> colorOptionsNames;

    @NotNull(message = "El tipo de comercialización es requerido")
    private CommercializationType commercializationType;

    //patrones de comercializacion
    @NotEmpty(message = "Debe seleccionar al menos cantidad de comercialización")
    @Valid
    private List<ProductCommercialQuantityDTO> commercialQuantities;

    //CAMPOS RELACIONADOS(request)
    @NotNull(message = "Debe seleccionar una subcategoria")
    private Long subCategoryId;

    @NotEmpty(message = "Debe seleccionar al menos una opcion de tipo de material")
    private List<Long> materialOptionIds;

    @NotEmpty(message = "Debe seleccionar al menos una opcion de color")
    private List<Long> colorOptionIds;

    //Fechas de auditoria
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

}
