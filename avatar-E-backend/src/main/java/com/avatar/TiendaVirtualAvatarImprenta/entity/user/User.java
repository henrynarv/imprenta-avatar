package com.avatar.TiendaVirtualAvatarImprenta.entity.user;

import com.avatar.TiendaVirtualAvatarImprenta.entity.order.Order;
import com.avatar.TiendaVirtualAvatarImprenta.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.*;
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

    @Column(unique = true, nullable = false, length = 20)
    @Length(min = 8, max = 20, message = "La cédula/RUT debe tener entre 8 y 20 caracteres")
    private String cedula;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(unique = true, nullable = false, length = 100)
    @Email(message = "El correo debe tener un formato valido")
    private String email;

    @Column(nullable = false, length = 100)
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String comuna;

    @Column(nullable = false, length = 100)
    private String region;

    @Column(name = "is_business")
    @Builder.Default
    private Boolean isBusiness = false; // Indica si es empresa

    //Noombre del negocio
    @Column(name = "business_name", length = 200)
    private String businessName;

    @Column(name ="rut", length = 20)
    private String rut;//RUT de la empresa(opcional)

    @Builder.Default
    private Boolean active = true;
    @PrePersist
    @PreUpdate
    public void prePersist() {
        if (active == null) {
            active = true;
        }
    }

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserRole role = UserRole.ROLE_USER;

    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private List<Order> orders; // <--- Agregar la relación con la entidad Order aquí <--->

    @CreatedDate
    @Column(name ="created_at", columnDefinition = "TIMESTAMP", nullable = false, updatable = false)
    private LocalDateTime createdAt;   // dejar sin inicializar para que la auditoría lo ponga

    @LastModifiedDate
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP")
    private LocalDateTime updatedAt;


    // Métodos helpers (evitan NPE si no hay valor todavía)
    public OffsetDateTime getCreatedAtInChile() {
        return createdAt != null ? createdAt.atZone(ZoneId.of("America/Santiago")).toOffsetDateTime() : null;
    }

    public OffsetDateTime getUpdatedAtInChile() {
        return updatedAt != null ? updatedAt.atZone(ZoneId.of("America/Santiago")).toOffsetDateTime() : null;
    }

    public String getFullName(){
        return firstName + " " + lastName;
    }

    //Método helper para display name (empresa o persona)
    public String getDisplayName(){
        return isBusiness && businessName != null ? businessName : getFullName();
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
