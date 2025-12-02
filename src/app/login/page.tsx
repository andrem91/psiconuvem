'use client'

import { useActionState } from 'react'
import { login, AuthState } from '@/lib/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
    const initialState: AuthState = { errors: {} }
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-bold text-gray-900">
                        PsicoNuvem
                    </h1>
                    <h2 className="mt-6 text-center text-xl text-gray-600">
                        Entre na sua conta
                    </h2>
                </div>

                <form action={formAction} className="mt-8 space-y-6">
                    {state.errors?._form && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {state.errors._form[0]}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="seu@email.com"
                            />
                            {state.errors?.email && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                            />
                            {state.errors?.password && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Entrando...' : 'Entrar'}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Não tem conta?{' '}
                        <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-500">
                            Cadastre-se grátis
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}