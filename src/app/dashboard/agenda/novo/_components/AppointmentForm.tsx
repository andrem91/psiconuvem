'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createAppointment } from '@/lib/actions/appointments'
import { VALID_DURATIONS } from '@/lib/validations/appointment'

type Patient = {
    id: string
    name: string
}

type AppointmentFormProps = {
    patients: Patient[]
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? 'Criando...' : 'Criar Agendamento'}
        </button>
    )
}

export function AppointmentForm({ patients }: AppointmentFormProps) {
    const [state, formAction] = useActionState(createAppointment, {})
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [type, setType] = useState<'presencial' | 'online'>('presencial')

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0]

    // Combine date + time into ISO string for submission
    const scheduledAt = date && time
        ? new Date(`${date}T${time}`).toISOString()
        : ''

    return (
        <form action={formAction} className="space-y-6">
            {/* Error messages */}
            {state.errors?._form && (
                <div className="rounded-lg bg-red-50 p-4">
                    <div className="flex">
                        <svg
                            className="h-5 w-5 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{state.errors._form[0]}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Patient */}
            <div>
                <label
                    htmlFor="patientId"
                    className="block text-sm font-medium text-gray-700"
                >
                    Paciente <span className="text-red-500">*</span>
                </label>
                <select
                    id="patientId"
                    name="patientId"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                >
                    <option value="">Selecione um paciente</option>
                    {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                            {patient.name}
                        </option>
                    ))}
                </select>
                {state.errors?.patientId && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.patientId[0]}
                    </p>
                )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Data <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        min={today}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="time"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Horário <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        id="time"
                        name="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            {/* Hidden field with calculated value */}
            <input type="hidden" name="scheduledAt" value={scheduledAt} />

            {state.errors?.scheduledAt && (
                <p className="text-sm text-red-600">{state.errors.scheduledAt[0]}</p>
            )}

            {/* Duration */}
            <div>
                <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700"
                >
                    Duração <span className="text-red-500">*</span>
                </label>
                <select
                    id="duration"
                    name="duration"
                    defaultValue="50"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                >
                    {VALID_DURATIONS.map((duration) => (
                        <option key={duration} value={duration}>
                            {duration} minutos
                        </option>
                    ))}
                </select>
                {state.errors?.duration && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.duration[0]}
                    </p>
                )}
            </div>

            {/* Type */}
            <div>
                <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                >
                    Modalidade <span className="text-red-500">*</span>
                </label>
                <select
                    id="type"
                    name="type"
                    defaultValue="presencial"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                >
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                </select>
                {state.errors?.type && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.type[0]}</p>
                )}
            </div>

            {/* Telepsychology Consent (only shown if online) */}
            <div
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                style={{
                    display: 'none',
                }}
                ref={(div) => {
                    if (div) {
                        const form = div.closest('form')
                        const typeSelect = form?.querySelector<HTMLSelectElement>('#type')

                        const updateVisibility = () => {
                            if (typeSelect?.value === 'online') {
                                div.style.display = 'block'
                            } else {
                                div.style.display = 'none'
                            }
                        }

                        typeSelect?.addEventListener('change', updateVisibility)
                        updateVisibility()
                    }
                }}
            >
                <div className="flex items-start">
                    <input
                        type="checkbox"
                        id="telepsyConsent"
                        name="telepsyConsent"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="telepsyConsent" className="ml-3 text-sm text-gray-700">
                        Paciente autorizou atendimento online (CFP 09/2024)
                    </label>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                >
                    Observações (opcional)
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Adicione observações sobre o agendamento..."
                />
                {state.errors?.notes && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.notes[0]}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
                <SubmitButton />
            </div>
        </form>
    )
}
