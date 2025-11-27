package com.avatar.TiendaVirtualAvatarImprenta.repository.user;

import com.avatar.TiendaVirtualAvatarImprenta.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {


    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByCedula(String cedula);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByCedula(String cedula);
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.active = true")
    Optional<User>  findByEmailAndActiveTrue(@Param("email") String email);
}
