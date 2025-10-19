package com.avatar.TiendaVirtualAvatarImprenta.config.product;

import com.avatar.TiendaVirtualAvatarImprenta.dto.product.*;
import com.avatar.TiendaVirtualAvatarImprenta.entity.product.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final ModelMapper modelMapper;
    private final ProductCommercialQuantityMapper productCommercialQuantityMapper;



    //ENTITY -> DTO
    public ProductDTO toDTO(Product product){
        ProductDTO productDTO = modelMapper.map(product, ProductDTO.class);


        //Subcategory(response)
        if(product.getSubcategory() != null){
            productDTO.setSubCategoryId(product.getSubcategory().getId());
            productDTO.setSubcategoryName(product.getSubcategory().getName());
        }



        //Materiales con precio extra (para response)
        // 🔹 MaterialOptions con precio adicional
        if (product.getMaterialOptions() != null) {
            productDTO.setMaterialOptions(
                    product.getMaterialOptions().stream()
                            .map(pm -> ProductMaterialOptionDTO.builder()
                                    .id(pm.getId())
                                    .materialOptionDTO(
                                            MaterialOptionDTO.builder()
                                                    .id(pm.getMaterialOption().getId())
                                                    .name(pm.getMaterialOption().getName())
                                                    .build()
                                    )
                                    .extraPrice(pm.getExtraPrice())
                                    .build())
                            .collect(Collectors.toList())
            );
            //simpre hay una lista , aunquenno haya materiales
            /*List<ProductMaterialOption> productMaterialOptions =
                    product.getMaterialOptions() != null ? product.getMaterialOptions(): List.of();
            productDTO.setMaterialOptions(
                    productMaterialOptions.stream()
                            .map(pm -> ProductMaterialOptionDTO.builder()
                                    .id(pm.getId())
                                    .materialOptionDTO(
                                            MaterialOptionDTO.builder()
                                                    .id(pm.getMaterialOption().getId())
                                                    .name(pm.getMaterialOption().getName())
                                                    .build()
                                    )
                                    .extraPrice(pm.getExtraPrice())
                                    .build())
                            .collect(Collectors.toList())
            );*/


            // Convierte los materiales del producto en DTOs con id, nombre y precio extra, y los asigna al productDTO.
            productDTO.setMaterialOptions(
                    product.getMaterialOptions().stream()
                            .map(pm -> ProductMaterialOptionDTO.builder()
                                    .id(pm.getId()) // id del registro intermedio
                                    .materialOptionDTO(MaterialOptionDTO.builder()
                                            .id(pm.getMaterialOption().getId())
                                            .name(pm.getMaterialOption().getName())
                                            .build())
                                    .extraPrice(pm.getExtraPrice())
                                    .build()
                            )
                            .collect(Collectors.toList())
            );

            //MaterialOptions(response)
            productDTO.setMaterialOptionsNames(
                    product.getMaterialOptions().stream()
                            .map(pm -> pm.getMaterialOption().getName())
                            .collect(java.util.stream.Collectors.toList())
            );

            //MaterialOptions ID(response)
            productDTO.setMaterialOptionIds(
                    product.getMaterialOptions().stream()
                            .map(pm -> pm.getMaterialOption().getId())
                            .collect(Collectors.toList())
            );
        }

        //ColorOptions(response)
        if(product.getColorOptions() != null){
            productDTO.setColorOptions(
                    product.getColorOptions().stream()
                            .map(color -> ColorOptionDTO.builder()
                                    .id(color.getId())
                                    .code(color.getCode())
                                    .name(color.getName())
                                    .build())
                            .collect(Collectors.toList())
            );



            productDTO.setColorOptionsNames(
                    product.getColorOptions().stream()
                            .map(ColorOption::getName)
                            .collect(Collectors.toList())
            );

            productDTO.setColorOptionIds(
                    product.getColorOptions().stream()
                            .map(ColorOption::getId)
                            .collect(Collectors.toList())
            );
        }



        //patrones de comercializacion ===>  productQuantities(response)
        //Este codigo tiene y funiona de la misma manera que ele de abajo
        /*if(product.getCommercialQuantities()!= null){
            productDTO.setCommercialQuantities(
                    product.getCommercialQuantities().stream()
                            .map(pcq -> ProductCommercialQuantityDTO.builder()
                                    .id(pcq.getId())
                                    .quantity(pcq.getQuantity())
                                    .price(pcq.getPrice())
                                    .build()
                            )
                            .collect(Collectors.toList())
            );
        }*/

        //patrones de comercializacion ===>  productQuantities(response)
        if(product.getCommercialQuantities() != null){
            productDTO.setCommercialQuantities(
                    product.getCommercialQuantities().stream()
                            .map(productCommercialQuantityMapper::toDTO)
                            .collect(Collectors.toList())
            );
        }
        return productDTO;

    }


    //DTO -> ENTITY
    public Product toEntity(ProductDTO productDTO){
        Product product = modelMapper.map(productDTO, Product.class);


        //realciones (subCategory, materiales, colores y cantidades)
        //se cargan en el servicio de product
        product.setSubcategory(null);
        product.setMaterialOptions(null);
        product.setColorOptions(null);
        product.setCommercialQuantities(null);
        product.setCommercialQuantities(null);
        return product;
    }



}
