package com.avatar.TiendaVirtualAvatarImprenta.dto.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.java.Log;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CategoryDTO {
    //Request
    private Log id;

    @NotBlank(message = "El codigo de la categoria es requerido")
    private String code;

    @NotBlank(message = "El nombre de la categoria es requerido")
    private String name;

    /** Subcategorías asociadas (solo nombres y IDs para response) */
    private List<SubCategorySummaryDTO>subCategories;

}
