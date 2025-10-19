package com.avatar.TiendaVirtualAvatarImprenta.repository.product;

import com.avatar.TiendaVirtualAvatarImprenta.entity.product.ColorOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ColorRepository extends JpaRepository<ColorOption, Long> {
}
