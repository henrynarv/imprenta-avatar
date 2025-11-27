import com.avatar.TiendaVirtualAvatarImprenta.entity.order.Order;
import com.avatar.TiendaVirtualAvatarImprenta.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
/*
    private final OrderRepository orderRepository;

    // Crear una nueva orden con correlativo reiniciado por año
    public Order createOrder(Order order) {
        int year = order.getOrderDate().getYear();

        // Número de órdenes existentes en el mismo año
        long count = orderRepository.countOrdersByYear(year);

        // El siguiente número para este año
        int nextOrderNumber = (int) count + 1;

        // Generar el código único
        order.generateCode(nextOrderNumber);

        // Calcular el total antes de guardar
        calculateTotalAmount(order);

        // Guardar en la base
        return orderRepository.save(order);
    }

    // Calcula el total de la orden
    public void calculateTotalAmount(Order order) {
        BigDecimal itemsTotal = order.getItems().stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingCost = order.getShippingType() != null
                ? order.getShippingType().getCost()
                : BigDecimal.ZERO;

        order.setTotalAmount(itemsTotal.add(shippingCost));
    }

    // Métodos auxiliares
    public void addItem(Order order, OrderItem item) {
        item.setOrder(order);
        order.getItems().add(item);
        calculateTotalAmount(order);
    }

    public void removeItem(Order order, OrderItem item) {
        order.getItems().remove(item);
        item.setOrder(null);
        calculateTotalAmount(order);
    }

    public void updateShippingType(Order order, ShippingType shippingType) {
        order.setShippingType(shippingType);
        calculateTotalAmount(order);
    }

 */
}
