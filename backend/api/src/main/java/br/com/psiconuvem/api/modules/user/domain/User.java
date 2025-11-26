package br.com.psiconuvem.api.modules.user.domain;

import br.com.psiconuvem.api.core.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role = Role.PSYCHOLOGIST;

    public enum Role {
        ADMIN, PSYCHOLOGIST, ASSISTANT
    }
}
