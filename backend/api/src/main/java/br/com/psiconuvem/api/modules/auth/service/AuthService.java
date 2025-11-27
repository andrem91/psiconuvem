package br.com.psiconuvem.api.modules.auth.service;

import br.com.psiconuvem.api.core.security.JwtService;
import br.com.psiconuvem.api.core.security.TenantContext; // <--- IMPORTANTE
import br.com.psiconuvem.api.modules.auth.dto.AuthResponse;
import br.com.psiconuvem.api.modules.auth.dto.LoginRequest;
import br.com.psiconuvem.api.modules.auth.dto.RegisterRequest;
import br.com.psiconuvem.api.modules.tenant.domain.Tenant;
import br.com.psiconuvem.api.modules.tenant.repository.TenantRepository;
import br.com.psiconuvem.api.modules.user.domain.User;
import br.com.psiconuvem.api.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIHYPHEN = Pattern.compile("-+");

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Iniciando registro de novo usuário: {}", request.getEmail());

        // 1. Validar duplicidade
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        try {
            Tenant tenant = new Tenant();
            tenant.setName(request.getName());
            tenant.setEmail(request.getEmail());
            tenant.setPlanType(Tenant.PlanType.TRIAL);
            tenant.setSubscriptionActive(true);

            tenant = tenantRepository.save(tenant);
            log.debug("Tenant criado: {}", tenant.getId());

            UUID tenantId = tenant.getId();
            TenantContext.setTenant(tenantId);

            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setRole(User.Role.PSYCHOLOGIST);

            user = userRepository.save(user);
            log.debug("User criado: {}", user.getId());

            String token = jwtService.generateToken(
                    user.getId(),
                    tenantId,
                    user.getEmail()
            );

            log.info("Registro bem-sucedido: {} (tenant: {})", user.getEmail(), tenant.getId());

            return AuthResponse.builder()
                    .token(token)
                    .slug(generateSlug(request.getName()))
                    .name(user.getName())
                    .email(user.getEmail())
                    .build();

        } finally {
            TenantContext.clear();
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Tentativa de login: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Email ou senha inválidos");
        }

        Tenant tenant = tenantRepository.findById(user.getTenantId())
                .orElseThrow(() -> new IllegalStateException("Tenant não encontrado"));

        UUID tenantId = tenant.getId();
        String token = jwtService.generateToken(
                user.getId(),
                tenantId,
                user.getEmail()
        );

        log.info("Login bem-sucedido: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .slug(generateSlug(tenant.getName()))
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    private String generateSlug(String name) {
        String noAccents = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lower = noAccents.toLowerCase(Locale.ROOT);
        String hyphenated = WHITESPACE.matcher(lower).replaceAll("-");
        String clean = NONLATIN.matcher(hyphenated).replaceAll("");
        String deduplicated = MULTIHYPHEN.matcher(clean).replaceAll("-");
        return deduplicated.replaceAll("^-|-$", "");
    }
}