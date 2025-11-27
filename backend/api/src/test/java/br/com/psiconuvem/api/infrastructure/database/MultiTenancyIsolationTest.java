package br.com.psiconuvem.api.infrastructure.database;

import br.com.psiconuvem.api.core.security.TenantContext;
import br.com.psiconuvem.api.modules.tenant.domain.Tenant;
import br.com.psiconuvem.api.modules.tenant.repository.TenantRepository;
import br.com.psiconuvem.api.modules.user.domain.User;
import br.com.psiconuvem.api.modules.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Testes de isolamento multi-tenancy usando Hibernate Filter.
 *
 * Valida que:
 * 1. Dados de tenants diferentes são completamente isolados
 * 2. Tentativa de salvar sem tenant lança exceção
 * 3. Filtro SQL (WHERE tenant_id = ?) é aplicado corretamente
 */
@SpringBootTest
@Transactional
class MultiTenancyIsolationTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void setup() {
        // Limpa banco antes de cada teste (segurança extra)
        userRepository.deleteAll();
        tenantRepository.deleteAll();
        entityManager.flush();
    }

    @AfterEach
    void cleanup() {
        // Limpa contexto após cada teste
        TenantContext.clear();
    }

    @Test
    @DisplayName("Deve isolar dados entre diferentes tenants")
    void deveIsolarDadosEntreTenants() {
        // 1. Criar 2 tenants (clínicas) - IDs são gerados automaticamente
        Tenant tenantMaria = createTenant("Clínica Dra. Maria", "maria@psicologa.com");
        Tenant tenantJoao = createTenant("Clínica Dr. João", "joao@psicologo.com");

        // 2. Criar usuário para tenant Maria
        TenantContext.setTenant(tenantMaria.getId()); // 🔥 Usar ID real do banco
        User userMaria = createUser("Dra. Maria Silva", "maria@psicologa.com");

        // 3. Criar usuário para tenant João
        TenantContext.setTenant(tenantJoao.getId()); // 🔥 Usar ID real do banco
        User userJoao = createUser("Dr. João Silva", "joao@psicologo.com");

        // ⚡ CRÍTICO: Força escrita no banco e limpa cache Hibernate
        entityManager.flush();
        entityManager.clear();

        // 4. VALIDAÇÃO: Tenant Maria vê apenas seus dados
        TenantContext.setTenant(tenantMaria.getId());
        List<User> usuariosClinicaMaria = userRepository.findAll();

        assertThat(usuariosClinicaMaria).hasSize(1);
        assertThat(usuariosClinicaMaria.get(0).getName()).isEqualTo("Dra. Maria Silva");
        assertThat(usuariosClinicaMaria.get(0).getEmail()).isEqualTo("maria@psicologa.com");

        // 5. VALIDAÇÃO: Tenant João vê apenas seus dados
        TenantContext.setTenant(tenantJoao.getId());
        List<User> usuariosClinicaJoao = userRepository.findAll();

        assertThat(usuariosClinicaJoao).hasSize(1);
        assertThat(usuariosClinicaJoao.get(0).getName()).isEqualTo("Dr. João Silva");
        assertThat(usuariosClinicaJoao.get(0).getEmail()).isEqualTo("joao@psicologo.com");
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar salvar sem tenant no contexto")
    void deveLancarExcecaoAoSalvarSemTenant() {
        // Arrange: Sem tenant no contexto
        TenantContext.clear();

        User usuarioOrfao = new User();
        usuarioOrfao.setName("Usuário Órfão");
        usuarioOrfao.setEmail("orfao@example.com");
        usuarioOrfao.setPasswordHash("hash123");

        // Act & Assert: Deve lançar exceção ao tentar salvar
        InvalidDataAccessApiUsageException exception = assertThrows(
                InvalidDataAccessApiUsageException.class,
                () -> userRepository.save(usuarioOrfao),
                "Deveria lançar exceção ao salvar sem tenant"
        );

        // Validação adicional: Mensagem da exceção raiz
        assertThat(exception.getCause()).isInstanceOf(IllegalStateException.class);
        assertThat(exception.getCause().getMessage())
                .contains("Tentativa de salvar registro sem Tenant");
    }

    // ========== MÉTODOS AUXILIARES ==========

    private Tenant createTenant(String name, String email) {
        Tenant tenant = new Tenant();
        tenant.setName(name);
        tenant.setEmail(email);
        return tenantRepository.save(tenant);
    }

    private User createUser(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash("$2a$10$fakeHashForTesting");
        user.setRole(User.Role.PSYCHOLOGIST);
        // tenant_id será setado automaticamente pelo @PrePersist da BaseEntity
        return userRepository.save(user);
    }
}