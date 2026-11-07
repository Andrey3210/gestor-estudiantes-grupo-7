package pe.grupo7.estudiantes;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/estudiantes")
class EstudianteControlador {
    private final Map<String, Estudiante> estudiantes = new ConcurrentHashMap<>();

    EstudianteControlador() {
        List.of(
                new Estudiante("E-001", "Valeria Campos", "Ingeniería de Software"),
                new Estudiante("E-002", "Mateo Ríos", "Ingeniería de Sistemas"),
                new Estudiante("E-003", "Camila Torres", "Ciencia de la Computación"),
                new Estudiante("E-004", "Diego Salas", "Ingeniería de Software"),
                new Estudiante("E-005", "Lucía Herrera", "Ingeniería de Sistemas")
        ).forEach(estudiante -> estudiantes.put(estudiante.codigo(), estudiante));
    }

    @GetMapping
    List<Estudiante> listar() {
        return estudiantes.values().stream()
                .sorted(Comparator.comparing(Estudiante::codigo))
                .toList();
    }

    @PostMapping
    ResponseEntity<Estudiante> agregar(@Valid @RequestBody Estudiante estudiante) {
        if (estudiantes.putIfAbsent(estudiante.codigo(), estudiante) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un estudiante con ese código.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(estudiante);
    }

    @DeleteMapping("/{codigo}")
    ResponseEntity<Void> eliminar(@PathVariable String codigo) {
        if (estudiantes.remove(codigo) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El estudiante ya no existe.");
        }
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, String>> errorOperacion(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("mensaje", error.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> errorValidacion(MethodArgumentNotValidException error) {
        String mensaje = error.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.badRequest().body(Map.of("mensaje", mensaje));
    }
}
