// services/apiService.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://koperasihub.koyeb.app'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ApiOptions {
    method?: RequestMethod
    body?: any
    headers?: Record<string, string>
    token?: string
    silent?: boolean
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
    const { method = 'GET', body, headers = {}, token, silent = false } = options

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
        } else if (contentType && contentType.includes('text/html')) {
            // When API is down (Koyeb free tier sleeping or error), it often returns HTML
            await response.text(); // Consume the body
            responseData = { 
                message: 'Layanan sedang tidak tersedia atau dalam mode hemat daya. Silakan coba lagi dalam beberapa saat.',
                is_html: true 
            }
        } else {
            const rawText = await response.text()
            responseData = { message: rawText }
        }
    } catch (parseError) {
        console.error('Failed to parse API response:', parseError)
        responseData = { message: 'Gagal memproses respon dari server' }
    }

    if (!response.ok) {
        // Log error response to console for server-side debugging unless silent
        if (!silent) {
            console.error(`API Error [${method} ${endpoint}]:`, {
                status: response.status,
                data: responseData
            });
        }

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
    async checkAffiliation(token: string, parentId: string | number, childId: string | number) {
        return apiRequest(`/users/check-affiliation?parent_id=${parentId}&child_id=${childId}`, {
            token,
        })
    },

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
    },

    async search(token: string, params: { role?: string, store_name?: string, page?: number, limit?: number }) {
        return apiRequest('/users/search', {
            method: 'POST',
            body: params,
            token,
        })
    },

    async updateUser(id: string | number, data: any, token: string) {
        return apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: data,
            token,
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
        });
    },

    async getRates(data: {
        store_id: number;
        shipping_address: {
            address: string;
            province: string;
            city: string;
            district: string;
            subdistrict: string;
            zipcode: string;
        };
        items: Array<{
            product_id: number;
            product_variant_id: number;
            quantity: number;
        }>;
    }, token?: string) {
        return apiRequest('/orders/rates', {
            method: 'POST',
            body: data,
            token,
        });
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
    async getProducts(params: { store_id?: string | number, page?: number, limit?: number, name?: string, status?: string, category_id?: string | number, target_customer?: string }, token?: string) {
        let query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.store_id) query.append('store_id', params.store_id.toString());
        if (params.name) query.append('name', params.name);
        if (params.status) query.append('status', params.status);
        if (params.category_id) query.append('product_category_id', params.category_id.toString());
        if (params.target_customer) query.append('target_customer', params.target_customer);

        const queryString = query.toString();
        const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, { token });
    },

    async searchProducts(params: { 
        slug?: string, 
        name?: string, 
        category_id?: string | number, 
        general_category_id?: string | number, 
        store_id?: string | number,
        target_customer?: string,
        status?: string,
        page?: number,
        limit?: number
    }, token?: string) {
        const { page, limit, ...body } = params;
        let query = new URLSearchParams();
        if (page) query.append('page', page.toString());
        if (limit) query.append('limit', limit.toString());

        const queryString = query.toString();
        const endpoint = `/products/search${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, {
            method: 'POST',
            body,
            token,
        });
    },

    async getProductDetail(id: string | number, token?: string) {
        return apiRequest(`/products/${id}`, { token });
    },

    async getProductDetailBySlug(slug: string, token?: string) {
        return apiRequest('/products/search', {
            method: 'POST',
            body: { slug },
            token,
        });
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
    },

    async duplicateProduct(id: string | number, token: string) {
        return apiRequest(`/products/${id}/duplicate`, {
            method: 'POST',
            token,
        });
    }
}

export const productOptionService = {
    async getList(token: string, params: { product_id?: string | number, store_id?: string | number }) {
        let query = new URLSearchParams();
        if (params.product_id) query.append('product_id', params.product_id.toString());
        if (params.store_id) query.append('store_id', params.store_id.toString());
        return apiRequest(`/product-options?${query.toString()}`, { token });
    },
    async create(token: string, data: { store_id: number; product_id: number; name: string }) {
        return apiRequest('/product-options', {
            method: 'POST',
            body: data,
            token,
        });
    },
    async update(token: string, id: string | number, data: { name: string }) {
        return apiRequest(`/product-options/${id}`, {
            method: 'PUT',
            body: data,
            token,
        });
    },
    async delete(token: string, id: string | number) {
        return apiRequest(`/product-options/${id}`, {
            method: 'DELETE',
            token,
        });
    }
}

export const productOptionValueService = {
    async getList(token: string, params: { option_id?: string | number, store_id?: string | number, product_id?: string | number }) {
        let query = new URLSearchParams();
        if (params.option_id) query.append('option_id', params.option_id.toString());
        if (params.store_id) query.append('store_id', params.store_id.toString());
        if (params.product_id) query.append('product_id', params.product_id.toString());
        return apiRequest(`/product-option-values?${query.toString()}`, { token });
    },
    async create(token: string, data: { store_id: number; product_option_id: number; value: string; image?: string }) {
        return apiRequest('/product-option-values', {
            method: 'POST',
            body: data,
            token,
        });
    },
    async update(token: string, id: string | number, data: { value: string; image?: string }) {
        return apiRequest(`/product-option-values/${id}`, {
            method: 'PUT',
            body: data,
            token,
        });
    },
    async delete(token: string, id: string | number) {
        return apiRequest(`/product-option-values/${id}`, {
            method: 'DELETE',
            token,
        });
    }
}

export const productVariantService = {
    async getList(token: string, productId: string | number) {
        return apiRequest(`/products/${productId}/variants`, { token });
    },
    async create(token: string, data: {
        store_id: number;
        product_id: number;
        sku: string;
        price: string | number;
        discount_price?: string | number;
        weight: number;
        image?: string;
        is_active?: boolean;
        option_value_ids: number[]
    }) {
        return apiRequest('/product-variants', {
            method: 'POST',
            body: data,
            token,
        });
    },
    async update(token: string, id: string | number, data: any) {
        return apiRequest(`/product-variants/${id}`, {
            method: 'PUT',
            body: data,
            token,
        });
    },
    async delete(token: string, id: string | number) {
        return apiRequest(`/product-variants/${id}`, {
            method: 'DELETE',
            token,
        });
    }
}

export const inventoryService = {
    async updateStock(token: string, data: {
        product_id: number;
        product_variant_id?: number;
        gudang_id: number;
        stock: number;
    }) {
        return apiRequest('/inventory/stock', {
            method: 'POST',
            body: data,
            token,
        });
    },
    async getStockByProduct(token: string, productId: string | number) {
        return apiRequest(`/inventory/product/${productId}`, { token });
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

export const affiliationService = {
    async create(token: string, data: { parent_id: number; type: string }) {
        return apiRequest('/affiliations/request', {
            method: 'POST',
            body: data,
            token,
            silent: true,
        })
    },

    async getIncoming(token: string, params: { types?: string[] } = {}) {
        let query = new URLSearchParams();
        if (params.types && params.types.length > 0) {
            params.types.forEach(type => query.append('types', type));
        }

        const queryString = query.toString();
        const endpoint = `/affiliations/parent${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, {
            token,
        })
    },

    async getChild(token: string, params: { status?: number, parent_id?: number } = {}) {
        let query = new URLSearchParams();
        if (params.status !== undefined) query.append('status', params.status.toString());
        if (params.parent_id !== undefined) query.append('parent_id', params.parent_id.toString());

        const queryString = query.toString();
        const endpoint = `/affiliations/child${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, {
            token,
        })
    },

    async approve(token: string, id: number | string) {
        return apiRequest(`/affiliations/${id}/approve`, {
            method: 'POST',
            token,
        })
    },

    async reject(token: string, id: number | string) {
        return apiRequest(`/affiliations/${id}/reject`, {
            method: 'POST',
            token,
        })
    },

    // Helper to find parents (users) by role
    async getParents(token: string, params: { role: string; search?: string }) {
        let query = new URLSearchParams();
        query.append('role', params.role);
        if (params.search) query.append('search', params.search);

        return apiRequest(`/users?${query.toString()}`, {
            token,
        })
    }
}

export const storeService = {
    async getStoreByUserId(token: string, userId: string | number) {
        return apiRequest(`/stores/user/${userId}`, {
            token,
        })
    },

    async getDetail(token: string, id: string | number) {
        return apiRequest(`/stores/${id}`, {
            token,
        })
    },

    async getStores(token: string, params: { page?: number, limit?: number, search?: string } = {}) {
        let query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.search) query.append('search', params.search);

        const queryString = query.toString();
        const endpoint = `/stores${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, { token });
    },

    async lookup(token: string, search: string) {
        return apiRequest(`/stores/lookup?subdomain=${search}`, {
            token,
        });
    },

    async getDashboardSummary(token: string, storeId: string | number) {
        return apiRequest(`/stores/${storeId}/dashboard-summary`, { token });
    }
}

export const orderService = {
    async createOrder(data: any, token: string) {
        return apiRequest('/orders', {
            method: 'POST',
            body: data,
            token,
        });
    },

    async getOrders(params: { user_id?: number, buyer_id?: number, store_id?: number, status?: string, payment_status?: string, payment_category?: string, search?: string, page?: number, limit?: number }, token: string) {
        let query = new URLSearchParams();
        if (params.user_id) query.append('user_id', params.user_id.toString());
        if (params.buyer_id) query.append('buyer_id', params.buyer_id.toString());
        if (params.store_id) query.append('store_id', params.store_id.toString());
        if (params.status) query.append('status', params.status);
        if (params.payment_status) query.append('payment_status', params.payment_status);
        if (params.payment_category) query.append('payment_category', params.payment_category);
        if (params.search) query.append('search', params.search);
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, { token });
    },

    async getOrderDetail(id: string | number, token: string) {
        return apiRequest(`/orders/${id}`, { token });
    },

    async updateOrderStatus(id: string | number, data: { status: string, admin_notes?: string }, token: string) {
        return apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: data,
            token,
        });
    },

    async updateOrderTracking(id: string | number, data: { tracking_number: string }, token: string) {
        return apiRequest(`/orders/${id}/tracking`, {
            method: 'PUT',
            body: data,
            token,
        });
    },

    async cancelOrder(id: string | number, token: string) {
        return apiRequest(`/orders/${id}/cancel`, {
            method: 'POST',
            token,
        });
    },

    async approvePiutang(orderId: string | number, token: string) {
        return apiRequest(`/orders/${orderId}/approve-piutang`, {
            method: 'POST',
            token,
        });
    },

    async rejectPiutang(orderId: string | number, data: { reason: string }, token: string) {
        return apiRequest(`/orders/${orderId}/reject-piutang`, {
            method: 'POST',
            body: data,
            token,
        });
    },

    async getOrderDebt(orderId: string | number, token: string) {
        return apiRequest(`/orders/${orderId}/debt`, {
            token,
        });
    }
}

export const debtService = {
    async getDebts(params: { user_id?: number, buyer_id?: number, store_id?: number, status?: string, page?: number, limit?: number }, token: string) {
        let query = new URLSearchParams();
        if (params.user_id) query.append('user_id', params.user_id.toString());
        if (params.buyer_id) query.append('buyer_id', params.buyer_id.toString());
        if (params.store_id) query.append('store_id', params.store_id.toString());
        if (params.status) query.append('status', params.status);
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        const endpoint = `/debts${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, { token });
    },

    async getPaymentUrl(debtId: string | number, type: 'installment' | 'po', token: string) {
        return apiRequest(`/debts/${debtId}/pay?type=${type}`, {
            token,
        });
    },

    async checkPo(token: string, storeId: string | number) {
        return apiRequest(`/debts/check-po?store_id=${storeId}`, {
            token,
        });
    }
}

export const campaignService = {
    async getStoreCampaigns(token: string, storeId: string | number) {
        return apiRequest(`/campaigns/store/${storeId}`, { token });
    },

    async getCampaignDetail(token: string, id: string | number) {
        return apiRequest(`/campaigns/${id}`, { token });
    },

    async createCampaign(token: string, data: {
        product_id: number;
        fee_per_click: number;
        fee_per_reshare: number;
        fee_per_sale: number;
        max_budget: number;
    }) {
        return apiRequest('/campaigns', {
            method: 'POST',
            body: data,
            token,
        });
    },

    async updateCampaign(token: string, id: string | number, data: {
        fee_per_click?: number;
        fee_per_reshare?: number;
        fee_per_sale?: number;
        max_budget?: number;
        is_active?: boolean;
        status?: boolean;
    }) {
        return apiRequest(`/campaigns/${id}`, {
            method: 'PUT',
            body: data,
            token,
        });
    },

    async deleteCampaign(token: string, id: string | number) {
        return apiRequest(`/campaigns/${id}`, {
            method: 'DELETE',
            token,
        });
    },

    async topupSaldo(token: string, amount: number) {
        return apiRequest('/campaigns/topup', {
            method: 'POST',
            body: { amount },
            token,
        });
    },

    async getTopupHistory(token: string, params: { page?: number, limit?: number } = {}) {
        let query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        const endpoint = `/campaigns/topup${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, { token });
    },

    async getCampaignShares(token: string, campaignId: number | string) {
        return apiRequest(`/campaigns/${campaignId}/shares`, { token });
    }
}

export const affiliatorService = {
    async getStats(token: string) {
        return apiRequest('/affiliator/stats', { token });
    },

    async generateShareLink(productId: string | number, token: string, parentShareCode?: string) {
        let endpoint = `/products/${productId}/share`;
        if (parentShareCode) {
            endpoint += `?sh=${parentShareCode}`;
        }
        return apiRequest(endpoint, { token });
    },

    async trackClick(shareCode: string, parentShareCode?: string, source?: string) {
        let endpoint = '/campaigns/track-click';
        if (parentShareCode) {
            endpoint += `?sh=${parentShareCode}`;
        }
        return apiRequest(endpoint, {
            method: 'POST',
            body: { 
                share_code: shareCode,
                source: source
            },
        });
    },

    async trackShare(shareCode: string, source?: string) {
        return apiRequest('/campaigns/track-share', {
            method: 'POST',
            body: { 
                share_code: shareCode,
                source: source
            },
        });
    },

    async withdraw(amount: number, token: string) {
        return apiRequest('/campaigns/withdrawal', {
            method: 'POST',
            body: { amount },
            token,
        });
    },

    async getWithdrawHistory(token: string) {
        return apiRequest('/campaigns/withdrawal', {
            token,
        });
    }
}

