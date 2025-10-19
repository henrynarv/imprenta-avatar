package com.avatar.TiendaVirtualAvatarImprenta.repository.carousel;

import com.avatar.TiendaVirtualAvatarImprenta.entity.carousel.CarouselItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarouselRepository extends JpaRepository<CarouselItem, Long> {
}
