package com.avatar.TiendaVirtualAvatarImprenta.config.product;

import com.avatar.TiendaVirtualAvatarImprenta.dto.product.CategoryDTO;
import com.avatar.TiendaVirtualAvatarImprenta.dto.product.SubCategorySummaryDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.Category;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.SubCategory;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CategoryMapper {
    private final ModelMapper modelMapper;

    //ENTITY -> DTO
    public CategoryDTO toDTO(Category category){
        CategoryDTO categoryDTO = modelMapper.map(category, CategoryDTO.class);

        //mapear subcategories simplificado SubCategorySummaryDTO (para evitar otra consulta en el frontend)
        if(category.getSubCategories() != null){
            categoryDTO.setSubCategories(
                    category.getSubCategories().stream()
                            .map(this::mapSubCategorySummary)
                            .collect(Collectors.toList())
            );
        }

        return categoryDTO;
    }

    //DTO -> ENTITY
    public Category toEntity(CategoryDTO categoryDTO){
        Category category = modelMapper.map(categoryDTO,Category.class);
        // No seteamos subcategorías aquí (se manejan en el servicio)
        category.setSubCategories(null);

        return category;
    }

    //conversionde subcategory a subcategorySummaryDTO
    private SubCategorySummaryDTO mapSubCategorySummary(SubCategory subCategory){
        return SubCategorySummaryDTO.builder()
                .id(subCategory.getId())
                .name(subCategory.getName())
                .code(subCategory.getCode())
                .build();
    }

}
