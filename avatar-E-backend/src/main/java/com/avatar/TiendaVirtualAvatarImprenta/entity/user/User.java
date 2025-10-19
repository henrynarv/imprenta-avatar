package com.avatar.TiendaVirtualAvatarImprenta.entity.user;

import com.avatar.TiendaVirtualAvatarImprenta.entity.order.Order;
import com.avatar.TiendaVirtualAvatarImprenta.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cedula;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true)
    private String email;


    private String password;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String address;


    private String comuna;

    private String region;

    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @OneToMany(mappedBy = "users")
    private List<Order> orders; // <--- Agregar la relación con la entidad Order aquí <--->

    @CreatedDate
    @Column(name ="created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;   // dejar sin inicializar para que la auditoría lo ponga

    @LastModifiedDate
    private ZonedDateTime updatedAt;


    // Métodos helpers (evitan NPE si no hay valor todavía)
    public ZonedDateTime getCreatedAtInChile() {
        if (createdAt == null) return null;
        return createdAt.withZoneSameInstant(ZoneId.of("America/Santiago"));
    }

    public ZonedDateTime getUpdatedAtInChile() {
        if (updatedAt == null) return null;
        return updatedAt.withZoneSameInstant(ZoneId.of("America/Santiago"));
    }


    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", cedula='" + cedula + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", address='" + address + '\'' +
                ", comuna='" + comuna + '\'' +
                ", region='" + region + '\'' +
                ", active=" + active +
                ", role=" + role +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
