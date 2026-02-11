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

    async onboarding(data: any) {
        return apiRequest('/onboarding', {
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

    async addAffiliation(data: { parent_id: number, child_id: number, type: string }, token?: string) {
        return apiRequest('/users/affiliate', {
            method: 'POST',
            body: data,
            token
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

export const shippingService = {
    async searchArea(input: string, token?: string) {
        return apiRequest('/shipping/areas', {
            method: 'POST',
            body: { input },
            token,
        })
    }
}

export const generalCategoryService = {
    async getList(token?: string) {
        return apiRequest('/general-categories', {
            token,
        })
    },

    async getDetail(token: string, id: string | number) {
        return apiRequest(`/general-categories/${id}`, {
            token,
        })
    },

    async create(token: string, data: any) {
        return apiRequest('/general-categories', {
            method: 'POST',
            body: data,
            token,
        })
    },

    async update(token: string, id: string | number, data: any) {
        return apiRequest(`/general-categories/${id}`, {
            method: 'PUT',
            body: data,
            token,
        })
    },

    async delete(token: string, id: string | number) {
        return apiRequest(`/general-categories/${id}`, {
            method: 'DELETE',
            token,
        })
    }
}

export const productCategoryService = {
    async getList(token: string) {
        return apiRequest('/product-categories', {
            token,
        })
    },

    async getDetail(token: string, id: string | number) {
        return apiRequest(`/product-categories/${id}`, {
            token,
        })
    },

    async create(token: string, data: any) {
        return apiRequest('/product-categories', {
            method: 'POST',
            body: data,
            token,
        })
    },

    async update(token: string, id: string | number, data: any) {
        return apiRequest(`/product-categories/${id}`, {
            method: 'PUT',
            body: data,
            token,
        })
    },

    async delete(token: string, id: string | number) {
        return apiRequest(`/product-categories/${id}`, {
            method: 'DELETE',
            token,
        })
    }
}

export const productService = {
    async getProducts(params: { store_id?: string | number, page?: number, limit?: number, name?: string, status?: string, category_id?: string | number }, token?: string) {
        let query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.store_id) query.append('store_id', params.store_id.toString());
        if (params.name) query.append('name', params.name);
        if (params.status) query.append('status', params.status);
        if (params.category_id) query.append('product_category_id', params.category_id.toString());

        const queryString = query.toString();
        const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, { token });
    },

    async getProductDetail(id: string | number, token?: string) {
        return apiRequest(`/products/${id}`, { token });
    },

    async createProduct(data: any, token: string) {
        return apiRequest('/products', {
            method: 'POST',
            body: data,
            token,
        });
    },

    async updateProduct(id: string | number, data: any, token: string) {
        return apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: data,
            token,
        });
    },

    async deleteProduct(id: string | number, token: string) {
        return apiRequest(`/products/${id}`, {
            method: 'DELETE',
            token,
        });
    }
}

export const gudangService = {
    async getList(token: string, params: { store_id?: string | number, page?: number, limit?: number, product_id?: string | number, product_variant_id?: string | number } = {}) {
        let query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.store_id) query.append('store_id', params.store_id.toString());
        if (params.product_id) query.append('product_id', params.product_id.toString());
        if (params.product_variant_id) query.append('product_variant_id', params.product_variant_id.toString());

        const queryString = query.toString();
        const endpoint = `/gudang${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, {
            token,
        })
    },

    async getDetail(token: string, id: string | number) {
        return apiRequest(`/gudang/${id}`, {
            token,
        })
    },

    async create(token: string, data: any) {
        return apiRequest('/gudang', {
            method: 'POST',
            body: data,
            token,
        })
    },

    async update(token: string, id: string | number, data: any) {
        return apiRequest(`/gudang/${id}`, {
            method: 'PUT',
            body: data,
            token,
        })
    },

    async delete(token: string, id: string | number) {
        return apiRequest(`/gudang/${id}`, {
            method: 'DELETE',
            token,
        })
    }
}

