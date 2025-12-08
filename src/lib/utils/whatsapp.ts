import { PatientDebtorDTO } from '@/lib/actions/financial-context'

/**
 * Gera mensagem de cobrança para WhatsApp.
 */
export function generateWhatsAppMessage(debtor: PatientDebtorDTO): string {
    const itemsText = debtor.items
        .map((item) => {
            const type = item.type === 'SESSION' ? 'Sessão' : 'Mensalidade'
            const date = new Date(item.date).toLocaleDateString('pt-BR')
            return `- ${type} (${date}): R$ ${item.amount.toFixed(2)}`
        })
        .join('\n')

    return encodeURIComponent(
        `Olá ${debtor.patientName}! 😊\n\n` +
            `Passando para lembrar sobre os valores em aberto:\n\n` +
            `${itemsText}\n\n` +
            `Total: R$ ${debtor.totalDebt.toFixed(2)}\n\n` +
            `Qualquer dúvida, estou à disposição!`
    )
}
