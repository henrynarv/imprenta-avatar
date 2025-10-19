package com.avatar.TiendaVirtualAvatarImprenta.repository.product;

import com.avatar.TiendaVirtualAvatarImprenta.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
