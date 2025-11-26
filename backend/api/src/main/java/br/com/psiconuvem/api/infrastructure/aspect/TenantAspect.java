package br.com.psiconuvem.api.infrastructure.aspect;

import br.com.psiconuvem.api.core.security.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TenantAspect {

    @PersistenceContext
    private EntityManager entityManager;

    // Roda antes de qualquer método dentro de qualquer pacote 'repository'
    @Before("bean(*Repository)")
    public void enableTenantFilter() {
        String tenantId = TenantContext.getTenant();

        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter")
                    .setParameter("tenantId", tenantId);
        }
    }
}
