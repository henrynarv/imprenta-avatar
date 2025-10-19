package com.avatar.TiendaVirtualAvatarImprenta.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCategorySummaryDTO {

    private Long id;
    private String code;
    private String name;
}
