package br.com.psiconuvem.api.infrastructure.aspect;

import br.com.psiconuvem.api.core.security.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@Slf4j
public class TenantAspect {

    @PersistenceContext
    private EntityManager entityManager;

    // Roda antes de qualquer método dentro de qualquer pacote 'repository'
    @Before("bean(*Repository)")
    public void enableTenantFilter() {
        UUID tenantId = TenantContext.getTenant();

        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter")
                    .setParameter("tenantId", tenantId);

            log.trace("Hibernate Filter ativado para tenant: {}", tenantId);
        }
    }
}
