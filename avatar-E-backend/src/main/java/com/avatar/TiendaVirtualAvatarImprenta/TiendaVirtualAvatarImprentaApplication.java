package com.avatar.TiendaVirtualAvatarImprenta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TiendaVirtualAvatarImprentaApplication {

	public static void main(String[] args) {
		SpringApplication.run(TiendaVirtualAvatarImprentaApplication.class, args);
	}

}
