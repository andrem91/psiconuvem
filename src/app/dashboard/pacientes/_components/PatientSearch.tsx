'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'

export function PatientSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentSearch = searchParams.get('search') || ''
    const [inputValue, setInputValue] = useState(currentSearch)

    const handleSearch = useCallback((value: string) => {
        setInputValue(value)

        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())

            if (value.trim()) {
                params.set('search', value.trim())
            } else {
                params.delete('search')
            }

            router.push(`/dashboard/pacientes?${params.toString()}`)
        })
    }, [router, searchParams])

    const clearSearch = () => {
        handleSearch('')
    }

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Buscar por nome..."
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {inputValue && (
                <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
            {isPending && (
                <div className="absolute inset-y-0 right-8 flex items-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
            )}
        </div>
    )
}
