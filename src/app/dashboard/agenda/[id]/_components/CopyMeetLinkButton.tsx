'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyMeetLinkButtonProps {
    link: string
}

export function CopyMeetLinkButton({ link }: CopyMeetLinkButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Erro ao copiar:', err)
        }
    }

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            title="Copiar link"
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado!
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                </>
            )}
        </button>
    )
}
