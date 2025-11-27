package com.avatar.TiendaVirtualAvatarImprenta.config.user;

import com.avatar.TiendaVirtualAvatarImprenta.dto.user.AuthResponse;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.RegisterRequest;
import com.avatar.TiendaVirtualAvatarImprenta.dto.user.UserDTO;
import com.avatar.TiendaVirtualAvatarImprenta.entity.user.User;
import com.avatar.TiendaVirtualAvatarImprenta.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    //RegisterRequest -> User Entity
    public User toEntity(RegisterRequest registerRequest){
        User user =  modelMapper.map(registerRequest,User.class);

       user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setActive(true);
        //Asigna le rol pordefecto si no viene
        if(user.getRole() == null){
            user.setRole(UserRole.ROLE_USER);
        }

        return user;
    }

    //User Entity -> UserDTO
    public UserDTO toDTO(User user){
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        userDTO.setFullName(user.getFullName());
        return userDTO;
    }

    //User Entity -> AuthResponse
    public AuthResponse toAuthResponse(User user){
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                //Token temporal(lo implementas despues)
                .token("temp-token-" + System.currentTimeMillis())
                .tokenType("Bearer")
                .build();
    }
}
