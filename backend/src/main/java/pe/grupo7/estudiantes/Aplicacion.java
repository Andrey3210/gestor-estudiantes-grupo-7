package pe.grupo7.estudiantes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class Aplicacion {
    public static void main(String[] args) {
        SpringApplication.run(Aplicacion.class, args);
    }
}

@Configuration
class ConfiguracionWeb implements WebMvcConfigurer {
    private final String[] origenes;

    ConfiguracionWeb(@Value("${app.origenes}") String[] origenes) {
        this.origenes = origenes;
    }

    @Override
    public void addCorsMappings(CorsRegistry registro) {
        registro.addMapping("/api/**")
                .allowedOrigins(origenes)
                .allowedMethods("GET", "POST", "DELETE")
                .allowedHeaders("Content-Type");
    }
}
