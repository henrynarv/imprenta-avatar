package com.avatar.TiendaVirtualAvatarImprenta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class TiendaVirtualAvatarImprentaApplication {

	public static void main(String[] args) {
		SpringApplication.run(TiendaVirtualAvatarImprentaApplication.class, args);
	}

}
