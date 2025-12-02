import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            psychologistId: string | null
        } & DefaultSession['user']
    }

    interface User {
        psychologistId: string | null
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        psychologistId: string | null
    }
}