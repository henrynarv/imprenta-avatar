package com.avatar.TiendaVirtualAvatarImprenta.config.email;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

@Configuration
public class EmailConfig {
    //configuracionde themeleaf para emails HTML

    @Bean
    public ITemplateResolver htmlTemplateResolver() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/email/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false); // true en producción
        resolver.setCheckExistence(true);
        resolver.setOrder(1);
        return resolver;
    }

    @Bean
    public SpringTemplateEngine emailTemplateEngine(ITemplateResolver htmlTemplateResolver) {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.addTemplateResolver(htmlTemplateResolver);
        engine.setEnableSpringELCompiler(true);
        return engine;
    }
}
