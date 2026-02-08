// services/apiService.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://koperasihub.koyeb.app'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ApiOptions {
    method?: RequestMethod
    body?: any
    headers?: Record<string, string>
    token?: string
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
    const { method = 'GET', body, headers = {}, token } = options

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    }

    if (token) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    if (body) {
        config.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config)

    let responseData: any = {}
    const contentType = response.headers.get('content-type')

    try {
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json()
        } else {
            const rawText = await response.text()
            responseData = { message: rawText }
        }
    } catch (parseError) {
        console.error('Failed to parse API response:', parseError)
        responseData = { message: 'Gagal memproses respon dari server' }
    }

    if (!response.ok) {
        // Log error response to console for server-side debugging
        console.error(`API Error [${method} ${endpoint}]:`, {
            status: response.status,
            data: responseData
        });

        const errorMessage = responseData.data?.error || responseData.meta?.message || responseData.message || 'Something went wrong';
        const error: any = new Error(errorMessage);
        error.data = responseData;
        error.status = response.status;
        throw error;
    }

    return responseData
}

export const authService = {
    async login(email: string, password: string) {
        return apiRequest('/login', {
            method: 'POST',
            body: { email, password },
        })
    },

    async register(data: any) {
        return apiRequest('/users', {
            method: 'POST',
            body: data,
        })
    },

    async createFlag(token: string, name: string) {
        return apiRequest('/flags', {
            method: 'POST',
            body: { name },
            token,
        })
    },

    async createStore(token: string, storeData: any) {
        return apiRequest('/stores', {
            method: 'POST',
            body: storeData,
            token,
        })
    },

    async getMe(token: string) {
        // Endpoint ini mungkin berbeda tergantung dokumentasi, asumsi /users/profile atau based on token decode
        // Tapi karena ini stateless JWT biasanya decode saja cukup di client/server
        // Namun kita coba tes validasi token jika ada endpointnya
        return { success: true } // Placeholder, usually handled by middleware or decoding
    }
}

export const userService = {
    async getUsers(token: string) {
        return apiRequest('/users', {
            token,
        })
    },

    async getUserDetail(token: string, id: string | number) {
        return apiRequest(`/users/${id}`, {
            token,
        })
    },

    async addAffiliation(data: { parent_id: number, child_id: number, type: string }) {
        return apiRequest('/users/affiliate', {
            method: 'POST',
            body: data,
        })
    }
}

export const adminService = {
    async getFlags(token: string) {
        return apiRequest('/flags', {
            token,
        })
    },

    async assignFlagToUser(token: string, data: { user_id: string | number, flag_id: string | number }) {
        return apiRequest('/users/flags', {
            method: 'POST',
            body: data,
            token,
        })
    },

    async registerIpaymu(token: string, storeId: string | number, body?: any) {
        return apiRequest(`/stores/${storeId}/register-ipaymu`, {
            method: 'POST',
            body,
            token,
        })
    }
}
