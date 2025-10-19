package com.avatar.TiendaVirtualAvatarImprenta.config.product;

import com.avatar.TiendaVirtualAvatarImprenta.dto.product.MaterialOptionDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.MaterialOption;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;


 //Mapper simple para MaterialOption ↔ MaterialOptionDTO
 //(solo id y name)
@Component
@RequiredArgsConstructor
public class MaterialOptionMapper {

    private final ModelMapper modelMapper;

    // ENTITY -> DTO
     MaterialOptionDTO ToDTO(MaterialOption materialOption){
         if(materialOption == null) {
             return null;
         }
         return modelMapper.map(materialOption, MaterialOptionDTO.class);
     }

     // DTO -> ENTITY
     MaterialOption toEntity(MaterialOptionDTO materialOptionDTO){
         if(materialOptionDTO == null) {
             return null;
         }
         return  modelMapper.map(materialOptionDTO, MaterialOption.class);
     }
}
