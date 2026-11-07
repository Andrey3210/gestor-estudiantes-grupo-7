package pe.grupo7.estudiantes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record Estudiante(
        @NotBlank(message = "Escribe un código.")
        @Pattern(regexp = "[A-Z0-9-]{3,16}", message = "El código debe tener de 3 a 16 letras, números o guiones.")
        String codigo,
        @NotBlank(message = "Escribe el nombre completo.")
        @Size(max = 80, message = "El nombre admite hasta 80 caracteres.")
        String nombre,
        @NotBlank(message = "Selecciona una carrera.")
        @Size(max = 80, message = "La carrera admite hasta 80 caracteres.")
        String carrera
) {
    public Estudiante {
        codigo = codigo == null ? null : codigo.strip().toUpperCase(java.util.Locale.ROOT);
        nombre = nombre == null ? null : nombre.strip();
        carrera = carrera == null ? null : carrera.strip();
    }
}
