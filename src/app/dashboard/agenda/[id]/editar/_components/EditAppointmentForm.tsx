'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateAppointment } from '@/lib/actions/appointments'
import { VALID_DURATIONS } from '@/lib/validations/appointment'

type Patient = {
    id: string
    name: string
}

type Appointment = {
    id: string
    patientId: string
    scheduledAt: string
    duration: number
    type: string
    notes: string | null
    telepsyConsent: boolean
    patient?: { id: string; name: string } | null
}

type EditAppointmentFormProps = {
    appointment: Appointment
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
            {pending ? 'Salvando...' : 'Salvar Alterações'}
        </button>
    )
}

export function EditAppointmentForm({ appointment, patients }: EditAppointmentFormProps) {
    const updateWithId = updateAppointment.bind(null, appointment.id)
    const [state, formAction] = useActionState(updateWithId, {})

    const scheduledDate = new Date(appointment.scheduledAt)
    const [date, setDate] = useState(scheduledDate.toISOString().split('T')[0])
    const [time, setTime] = useState(scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }))
    const [type, setType] = useState<'presencial' | 'online'>(appointment.type as any)

    // Combine date + time into ISO string for submission
    const scheduledAt = date && time
        ? new Date(`${date}T${time}`).toISOString()
        : ''

    return (
        <form action={formAction} className="space-y-6">
            {/* Error messages */}
            {state.errors?._form && (
                <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-800">{state.errors._form[0]}</p>
                </div>
            )}

            {/* Patient (readonly) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Paciente
                </label>
                <input
                    type="text"
                    value={appointment.patient?.name || ''}
                    disabled
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                />
                <input type="hidden" name="patientId" value={appointment.patientId} />
            </div>

            {/* Hidden field for scheduledAt */}
            <input type="hidden" name="scheduledAt" value={scheduledAt} />

            {/* Date */}
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Data <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                />
                {state.errors?.scheduledAt && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.scheduledAt[0]}</p>
                )}
            </div>

            {/* Time */}
            <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    Horário <span className="text-red-500">*</span>
                </label>
                <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                />
            </div>

            {/* Duration */}
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duração <span className="text-red-500">*</span>
                </label>
                <select
                    id="duration"
                    name="duration"
                    defaultValue={appointment.duration}
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
                    <p className="mt-1 text-sm text-red-600">{state.errors.duration[0]}</p>
                )}
            </div>

            {/* Type */}
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Tipo de Atendimento
                </label>
                <select
                    id="type"
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="presencial">🏢 Presencial</option>
                    <option value="online">🖥️ Online (Telepsicologia)</option>
                </select>
            </div>

            {/* Telepsychology Consent */}
            {type === 'online' && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            id="telepsyConsent"
                            name="telepsyConsent"
                            defaultChecked={appointment.telepsyConsent}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="telepsyConsent" className="ml-3 text-sm text-gray-700">
                            Paciente autorizou atendimento online (CFP 09/2024)
                        </label>
                    </div>
                </div>
            )}

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Observações
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    defaultValue={appointment.notes || ''}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Anotações sobre o agendamento..."
                />
            </div>

            {/* Submit */}
            <div className="pt-4">
                <SubmitButton />
            </div>
        </form>
    )
}
