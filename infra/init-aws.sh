#!/bin/bash
echo "🔥 Inicializando LocalStack para PsicoNuvem..."

# --- S3 (Armazenamento) ---
# Separamos em buckets diferentes por segurança e organização
echo "Criando Buckets S3..."
awslocal s3 mb s3://psiconuvem-prontuarios     # Arquivos médicos (Sigiloso)
awslocal s3 mb s3://psiconuvem-public-assets   # Fotos do site público (Aberto)
awslocal s3 mb s3://psiconuvem-backups         # Dumps do banco (Segurança)

# --- SQS (Filas de Mensageria) ---
# Filas para processos que não podem travar o usuário
echo "Criando Filas SQS..."
awslocal sqs create-queue --queue-name email-notifications  # Envio de e-mails (Lento)
awslocal sqs create-queue --queue-name payment-webhooks     # Processar pagamentos Asaas (Crítico)

# --- SNS (Tópicos de Notificação) ---
# Tópicos para quando um evento precisa avisar vários sistemas
echo "Criando Tópicos SNS..."
awslocal sns create-topic --name appointment-events  # Ex: Consulta Agendada/Cancelada
awslocal sns create-topic --name payment-events      # Ex: Pagamento Confirmado (Ativa plano + Emite nota)

# --- DynamoDB (NoSQL) ---
# Tabela exclusiva para Logs de Auditoria (LGPD)
echo "Criando Tabelas DynamoDB..."
awslocal dynamodb create-table \
    --table-name audit_logs \
    --attribute-definitions \
        AttributeName=tenant_id,AttributeType=S \
        AttributeName=timestamp,AttributeType=N \
    --key-schema \
        AttributeName=tenant_id,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

echo "✅ Ambiente AWS Local pronto e configurado!"