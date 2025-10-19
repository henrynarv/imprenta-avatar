package com.avatar.TiendaVirtualAvatarImprenta.config.product;

import com.avatar.TiendaVirtualAvatarImprenta.dto.product.ProductMaterialOptionDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.ProductMaterialOption;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

/**
 * Mapper para convertir ProductMaterialOption ↔ ProductMaterialOptionDTO
 * aca esta el preco por material
 */
@Component
@RequiredArgsConstructor
public class ProductMaterialOptionMapper {

    private final ModelMapper modelMapper;

    // ENTITY -> DTO
    public ProductMaterialOptionDTO toDTO(ProductMaterialOption productMaterialOption) {
        if(productMaterialOption == null) {
            return null;
        }
        return modelMapper.map(productMaterialOption, ProductMaterialOptionDTO.class);
    }

    // DTO -> Entity
    public ProductMaterialOption toEntity(ProductMaterialOptionDTO dto) {
        if(dto == null){
            return null;
        }
        return modelMapper.map(dto, ProductMaterialOption.class);
    }
}
