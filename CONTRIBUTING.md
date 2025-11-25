# 🤝 Guia de Contribuição - PsicoNuvem

Obrigado por considerar contribuir com o PsicoNuvem! Este documento contém as diretrizes para contribuições.

---

## 📋 Convenções de Código

### Java/Spring Boot

```java
// ✅ BOM - Nomenclatura clara e consistente
@Service
public class PatientService {
    private final PatientRepository patientRepository;
    
    public Patient createPatient(CreatePatientRequest request) {
        // Lógica aqui
    }
}

// ❌ RUIM - Nomenclatura genérica
@Service
public class Service1 {
    private PatientRepository repo;
    
    public Patient create(Request r) {
        // Lógica aqui
    }
}
```

**Regras:**
- Classes em PascalCase: `PatientService`
- Métodos em camelCase: `createPatient()`
- Constantes em UPPER_SNAKE_CASE: `MAX_RETRY_ATTEMPTS`
- Packages em lowercase: `br.com.psiconuvem.modules.patient`
- Use Lombok para reduzir boilerplate
- Sempre adicione validações com `@Valid`

### TypeScript/Angular

```typescript
// ✅ BOM
@Component({
  selector: 'app-patient-list',
  standalone: true,
  // ...
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  
  constructor(private patientService: PatientService) {}
  
  ngOnInit(): void {
    this.loadPatients();
  }
  
  private loadPatients(): void {
    // Lógica aqui
  }
}

// ❌ RUIM
export class PatientList {
  data: any;
  
  constructor(public s: PatientService) {}
}
```

**Regras:**
- Componentes em PascalCase com sufixo `Component`
- Services em PascalCase com sufixo `Service`
- Sempre usar `private` ou `public` explicitamente
- Evitar `any`, sempre tipar variáveis
- Usar standalone components (Angular 18+)

---

## 🌳 GitFlow Workflow

### Criar nova feature

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar branch de feature
git checkout -b feature/nome-da-feature

# 3. Trabalhar e commitar
git add .
git commit -m "feat(modulo): descrição da mudança"

# 4. Push e criar PR
git push origin feature/nome-da-feature
```

### Nomenclatura de branches

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Feature | `feature/nome-descritivo` | `feature/patient-crud` |
| Bugfix | `bugfix/nome-do-bug` | `bugfix/cpf-validation` |
| Hotfix | `hotfix/nome-urgente` | `hotfix/security-vulnerability` |
| Release | `release/vX.Y.Z` | `release/v0.2.0` |

---

## 💬 Convenção de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[footer opcional]
```

### Tipos permitidos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `refactor`: Refatoração sem mudança de comportamento
- `perf`: Melhoria de performance
- `test`: Adicionar/modificar testes
- `docs`: Documentação
- `style`: Formatação de código
- `chore`: Tarefas de manutenção
- `build`: Mudanças no build system
- `ci`: Mudanças no CI/CD

### Exemplos

```bash
# Feature simples
git commit -m "feat(patient): add CPF validation"

# Feature com corpo
git commit -m "feat(auth): implement JWT refresh token

- Add RefreshTokenService
- Create /auth/refresh endpoint
- Update SecurityConfig to allow refresh endpoint"

# Breaking change
git commit -m "refactor(api)!: change endpoint structure

BREAKING CHANGE: All endpoints now require /api/v1 prefix"

# Correção com issue
git commit -m "fix(appointment): resolve double-booking bug

Closes #42"
```

---

## 🧪 Testes

### Backend

```bash
# Rodar todos os testes
mvn test

# Rodar teste específico
mvn test -Dtest=PatientServiceTest

# Gerar relatório de cobertura
mvn jacoco:report
```

**Requisitos:**
- Cobertura mínima: 60% global
- Cobertura mínima de domain: 80%
- Todos os testes devem passar

### Frontend

```bash
# Rodar testes
npm run test

# Modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

---

## 📝 Pull Request

### Checklist antes de abrir PR

- [ ] Código compila sem erros
- [ ] Todos os testes passam
- [ ] Cobertura de testes adequada
- [ ] Código formatado corretamente
- [ ] Sem warnings de lint
- [ ] Documentação atualizada (se necessário)
- [ ] CHANGELOG.md atualizado

### Template de PR

```markdown
## 🎯 Objetivo
Breve descrição do que o PR faz.

## 📝 Mudanças
- Mudança 1
- Mudança 2
- Mudança 3

## 🧪 Testes
- [ ] Testes unitários adicionados/atualizados
- [ ] Testes de integração adicionados/atualizados
- [ ] Testado manualmente

## 📸 Screenshots
(Se aplicável)

## 🔗 Issues relacionadas
Closes #123
```

### Revisão de código

**Como revisor:**
- Seja respeitoso e construtivo
- Foque no código, não na pessoa
- Sugira melhorias com exemplos
- Aprove apenas se está confortável com as mudanças

**Como autor:**
- Responda a todos os comentários
- Não leve críticas para o pessoal
- Peça esclarecimentos se necessário
- Agradeça pelas sugestões

---

## 🐛 Reportando Bugs

Use o template de issue:

```markdown
**Descrição do Bug**
Descrição clara do que aconteceu.

**Como Reproduzir**
Passos para reproduzir:
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
(Se aplicável)

**Ambiente**
- OS: [e.g. Ubuntu 22.04]
- Java: [e.g. 21]
- Spring Boot: [e.g. 3.3.5]
- Browser: [e.g. Chrome 120]

**Contexto Adicional**
Qualquer outra informação relevante.
```

---

## 💡 Sugerindo Melhorias

Use o template de feature request:

```markdown
**Descrição da Funcionalidade**
Descrição clara da funcionalidade sugerida.

**Problema que Resolve**
Qual problema essa feature resolve?

**Solução Proposta**
Como você imagina que isso funcionaria?

**Alternativas Consideradas**
Outras formas de resolver o problema.

**Contexto Adicional**
Screenshots, mockups, exemplos, etc.
```

---

## 📚 Recursos Úteis

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Angular Docs](https://angular.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

## ❓ Dúvidas?

- Abra uma [Discussion](https://github.com/SEU_USUARIO/psiconuvem/discussions)
- Entre em contato por [email](mailto:seu.email@example.com)

---

**Obrigado por contribuir! 🎉**
