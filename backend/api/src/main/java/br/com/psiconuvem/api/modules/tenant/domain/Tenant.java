package br.com.psiconuvem.api.modules.tenant.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Tenant {
    @Id
    @Column(length = 36)
    private String id; // O UUID vem manual ou do Auth

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "plan_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PlanType planType = PlanType.TRIAL;

    @Column(name = "subscription_active")
    private Boolean subscriptionActive = true;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (trialEndsAt == null) {
            trialEndsAt = LocalDateTime.now().plusDays(30);
        }
    }

    public enum PlanType {
        TRIAL, ESSENTIAL, PROFESSIONAL, PREMIUM
    }
}
