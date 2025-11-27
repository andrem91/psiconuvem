package br.com.psiconuvem.api.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;


@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-hours:24}")
    private int expirationHours;


    public String generateToken(UUID userId, UUID tenantId, String email) {
        SecretKey key = getSigningKey();

        Instant now = Instant.now();
        Instant expiration = now.plus(expirationHours, ChronoUnit.HOURS);

        String token = Jwts.builder()
                .subject(userId.toString())
                .claim("tenant_id", tenantId)
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(key)
                .compact();

        log.debug("Token JWT gerado para usuário {} (tenant: {})", userId, tenantId);
        return token;
    }

    public Claims validateAndExtractClaims(String token) {
        SecretKey key = getSigningKey();

        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        log.debug("Token JWT validado com sucesso para usuário {}", claims.getSubject());
        return claims;
    }

    public UUID extractUserId(String token) {
        Claims claims = validateAndExtractClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    public String extractTenantId(String token) {
        Claims claims = validateAndExtractClaims(token);
        return claims.get("tenant_id", String.class);
    }

    public String extractEmail(String token) {
        Claims claims = validateAndExtractClaims(token);
        return claims.get("email", String.class);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret deve ter no mínimo 32 caracteres (256 bits). " +
                            "Atual: " + keyBytes.length + " caracteres."
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
}