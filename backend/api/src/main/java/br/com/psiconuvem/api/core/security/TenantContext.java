package br.com.psiconuvem.api.core.security;

import org.hibernate.Session;

import java.util.UUID;

public class TenantContext {
    private static final ThreadLocal<UUID> currentTenant = new ThreadLocal<>();

    public static void setTenant(UUID tenantId) {
        currentTenant.set(tenantId);
    }

    public static UUID getTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
