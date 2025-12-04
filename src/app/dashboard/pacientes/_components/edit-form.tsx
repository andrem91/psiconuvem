'use client'

import { updatePatient, PatientState } from '@/lib/actions/patients'
import { useActionState } from 'react'
import { Database } from '@/types/supabase'
import Link from 'next/link'

type Patient = Database['public']['Tables']['Patient']['Row']

interface EditPatientFormProps {
    patient: Patient
}

export function EditPatientForm({ patient }: EditPatientFormProps) {
    const initialState: PatientState = { errors: {}, success: false }
    const updatePatientWithId = updatePatient.bind(null, patient.id)
    const [state, formAction, isPending] = useActionState(updatePatientWithId, initialState)

    const formattedBirthdate = patient.birthdate
        ? patient.birthdate.split('T')[0]
        : ''

    return (
        <form action={formAction} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 space-y-6">
                {/* Erro geral no topo */}
                {state.errors?._form && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-4">
                        <div className="text-sm text-red-700">
                            {state.errors._form.map((error, index) => (
                                <p key={index}>{error}</p>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Nome */}
                    <div className="sm:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            defaultValue={patient.name}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {state.errors?.name && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            defaultValue={patient.email || ''}
                            placeholder="paciente@email.com"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {state.errors?.email && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
                        )}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Telefone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            required
                            defaultValue={patient.phone}
                            placeholder="(11) 98765-4321"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {state.errors?.phone && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.phone[0]}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Formato: (XX) XXXXX-XXXX ou XXXXXXXXXXX</p>
                    </div>

                    {/* Data de Nascimento */}
                    <div className="sm:col-span-2">
                        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                            Data de Nascimento
                        </label>
                        <input
                            type="date"
                            name="birthdate"
                            id="birthdate"
                            defaultValue={formattedBirthdate}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {state.errors?.birthdate && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.birthdate[0]}</p>
                        )}
                    </div>

                    {/* LGPD Consent */}
                    <div className="sm:col-span-2">
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="lgpdConsent"
                                    name="lgpdConsent"
                                    type="checkbox"
                                    defaultChecked={patient.lgpdConsent}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="lgpdConsent" className="font-medium text-gray-700">
                                    Consentimento LGPD
                                </label>
                                <p className="text-gray-500">
                                    Paciente autorizou o armazenamento e processamento de dados pessoais e de saúde para fins de tratamento psicológico.
                                </p>
                            </div>
                        </div>
                        {state.errors?.lgpdConsent && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.lgpdConsent[0]}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Rodapé com Botões */}
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end gap-3 rounded-b-lg">
                <Link
                    href="/dashboard/pacientes"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    )
}