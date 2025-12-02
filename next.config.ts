import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Adicione isso para evitar que o 'pg' cause erros no build
  serverExternalPackages: ['pg'],
}

export default nextConfig
