import { MedplumClient } from '@medplum/core'

export async function createMedplumClient() {

    return new MedplumClient({
        clientId: process.env.MEDPLUM_CLIENT_ID,
        clientSecret: process.env.MEDPLUM_CLIENT_SECRET,
        baseUrl: process.env.MEDPLUM_BASE_URL,
    })
}