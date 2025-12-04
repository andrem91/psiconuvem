export default function ConfirmarEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* Ícone de email */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Título */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Verifique seu email! 📧
                        </h1>
                        <p className="mt-3 text-gray-600">
                            Cadastro realizado com sucesso!
                        </p>
                    </div>

                    {/* Mensagem principal */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 text-center">
                            Enviamos um <strong>link de confirmação</strong> para o seu email.
                            <br />
                            <span className="text-blue-600 font-medium">
                                Clique no link para ativar sua conta.
                            </span>
                        </p>
                    </div>

                    {/* Instruções */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Próximos passos:
                        </h3>
                        <ol className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                                    1
                                </span>
                                <span>Abra seu email e procure por uma mensagem da PsicoNuvem</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                                    2
                                </span>
                                <span>Clique no link de confirmação</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                                    3
                                </span>
                                <span>Faça login e comece a usar o PsicoNuvem!</span>
                            </li>
                        </ol>
                    </div>

                    {/* Avisos */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                        <p className="text-xs text-gray-500 text-center">
                            💡 <strong>Dica:</strong> Não se esqueça de verificar a pasta de spam ou lixo eletrônico
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                            ⏱️ O link de confirmação é válido por 24 horas
                        </p>
                    </div>

                    {/* Link para login */}
                    <div className="pt-4">
                        <a
                            href="/login"
                            className="block w-full text-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Voltar para o login
                        </a>
                    </div>
                </div>

                {/* Suporte */}
                <p className="mt-6 text-center text-xs text-gray-500">
                    Problemas com o email?{' '}
                    <a href="mailto:suporte@psiconuvem.com" className="text-blue-600 hover:text-blue-700 underline">
                        Entre em contato
                    </a>
                </p>
            </div>
        </div>
    )
}
