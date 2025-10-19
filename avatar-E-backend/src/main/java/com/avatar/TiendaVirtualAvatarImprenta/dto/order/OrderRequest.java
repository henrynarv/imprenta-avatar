package com.avatar.TiendaVirtualAvatarImprenta.dto.order;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderRequest {

    @NotNull(message = "El id del usuario es requerido")
    private Long userId;

    @NotNull(message = "El metodo de envio es requerido")
    private Long ShippingMethodId;

    @NotEmpty(message = "La orden debe tener almenos un producto")
    private List<OrderItemRequest> items;
}
