package com.avatar.TiendaVirtualAvatarImprenta.entity.product;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class StickerProduct extends Product{

    private String shape;
    private String finalCut;
}
