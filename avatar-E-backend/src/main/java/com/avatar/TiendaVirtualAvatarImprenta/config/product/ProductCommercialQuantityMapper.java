package com.avatar.TiendaVirtualAvatarImprenta.config.product;

import com.avatar.TiendaVirtualAvatarImprenta.dto.product.ProductCommercialQuantityDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.ProductCommercialQuantity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductCommercialQuantityMapper {

    private final ModelMapper modelMapper;

    //ENTITY -> DTO
    public ProductCommercialQuantityDTO toDTO(ProductCommercialQuantity productCommercialQuantity) {
        if(productCommercialQuantity == null){
            return null;
        }
        return modelMapper.map(productCommercialQuantity, ProductCommercialQuantityDTO.class);
    }

    //DTO -> ENTITY
    public ProductCommercialQuantity toEntity(ProductCommercialQuantityDTO productCommercialQuantityDTO) {
        if(productCommercialQuantityDTO == null){
            return null;
        }
        return  modelMapper.map(productCommercialQuantityDTO, ProductCommercialQuantity.class);
    }
}
