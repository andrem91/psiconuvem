-- Seed file para criar usuário de teste para E2E
-- Este arquivo é executado pelo Supabase local

-- Criar usuário de teste no Auth (se não existir)
-- Nota: Em Supabase local, usamos a API para criar usuários
-- Este script cria apenas os dados no banco

-- Inserir psicólogo de teste (assume que o auth.users já foi criado via API)
-- ID fixo para facilitar testes
INSERT INTO "Psychologist" (id, email, name, crp, "createdAt", "updatedAt")
VALUES (
    'e2e-test-psychologist-id',
    'teste@psiconuvem.com',
    'Dr. Teste E2E',
    '06/99999',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Inserir paciente de teste
INSERT INTO "Patient" (
    id, 
    "psychologistId", 
    name, 
    phone, 
    email, 
    "lgpdConsent",
    "createdAt", 
    "updatedAt"
)
VALUES (
    'e2e-test-patient-id',
    'e2e-test-psychologist-id',
    'Paciente Teste E2E',
    '11999999999',
    'paciente@teste.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
