package br.com.psiconuvem.api.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.trace("Request sem token JWT: {} {}", request.getMethod(), request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);

            Claims claims = jwtService.validateAndExtractClaims(token);

            String userId = claims.getSubject();
            UUID tenantId = claims.get("tenant_id", UUID.class);
            String email = claims.get("email", String.class);

            log.debug("Token JWT válido - User: {}, Tenant: {}, Email: {}",
                    userId, tenantId, email);

            TenantContext.setTenant(tenantId);

            List<SimpleGrantedAuthority> authorities = Collections.emptyList();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.trace("Usuário {} autenticado com sucesso", userId);

        } catch (JwtException e) {
            log.warn("Token JWT inválido: {}", e.getMessage());

        } catch (Exception e) {
            log.error("Erro ao processar token JWT", e);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            log.trace("TenantContext limpo após request");
        }
    }
}