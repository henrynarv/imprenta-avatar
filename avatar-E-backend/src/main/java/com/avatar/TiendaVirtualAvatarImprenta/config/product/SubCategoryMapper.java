package com.avatar.TiendaVirtualAvatarImprenta.config.product;

import com.avatar.TiendaVirtualAvatarImprenta.dto.product.ProductSummaryDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.product.SubCategoryDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.Product;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.SubCategory;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SubCategoryMapper {
    private final ModelMapper modelMapper;

    // ENTITY -> DTO
    public SubCategoryDTO toDTO (SubCategory subCategory){
        SubCategoryDTO subCategoryDTO = modelMapper.map(subCategory, SubCategoryDTO.class);
        // cargar datos de la category padre (para evitar otra consulta en el frontend)
        if(subCategory.getCategory() != null){
            subCategoryDTO.setCategoryId(subCategory.getCategory().getId());
            subCategoryDTO.setCategoryName(subCategory.getCategory().getName());
        }

        //cargar productos de la subcategory  ProductSummaryDTO
        if(subCategory.getProducts()  != null){
            subCategoryDTO.setProducts(
                    subCategory.getProducts().stream()
                            .map(this::mapProductSummary)
                            .collect(Collectors.toList())
            );
        }
        return subCategoryDTO;

    }

    // DTO -> ENTITY
    public SubCategory toEntity(SubCategoryDTO subCategoryDTO){
        SubCategory subCategory = modelMapper.map(subCategoryDTO, SubCategory.class);

        subCategory.setCategory(null);
        subCategory.setProducts(null);

        return subCategory;
    }



    //conversion manual de Product a ProductSummaryDTO
    private ProductSummaryDTO mapProductSummary(Product product) {
        return ProductSummaryDTO.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .build();
    }
}
