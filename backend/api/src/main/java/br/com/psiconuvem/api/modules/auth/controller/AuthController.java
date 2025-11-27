package br.com.psiconuvem.api.modules.auth.controller;

import br.com.psiconuvem.api.modules.auth.dto.AuthResponse;
import br.com.psiconuvem.api.modules.auth.dto.LoginRequest;
import br.com.psiconuvem.api.modules.auth.dto.RegisterRequest;
import br.com.psiconuvem.api.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller de autenticação.
 *
 * Endpoints públicos (não requerem token JWT):
 * - POST /auth/register - Cadastro de novo psicólogo
 * - POST /auth/login - Login com email/senha
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Nova requisição de registro: {}", request.getEmail());

        AuthResponse response = authService.register(request);

        log.info("Registro bem-sucedido: {} (tenant: {})",
                response.getEmail(), response.getSlug());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Tentativa de login: {}", request.getEmail());

        AuthResponse response = authService.login(request);

        log.info("Login bem-sucedido: {}", response.getEmail());

        return ResponseEntity.ok(response);
    }
}