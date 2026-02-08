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

export const biteshipService = {
    apiKey: process.env.NEXT_PUBLIC_BITESHIP_API_KEY,
    baseUrl: process.env.NEXT_PUBLIC_BITESHIP_API_URL,

    async searchArea(query: string, country: string = 'ID') {
        const response = await fetch(`${this.baseUrl}maps/areas?countries=${country}&input=${encodeURIComponent(query)}&type=single`, {
            headers: {
                'Authorization': this.apiKey || '',
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        // Transform response to include all location details
        if (result.success && result.areas) {
            return {
                success: true,
                areas: result.areas.map((area: any) => ({
                    id: area.id,
                    name: area.name,
                    province: area.administrative_division_level_1_name,
                    city: area.administrative_division_level_2_name,
                    district: area.administrative_division_level_3_name,
                    area: area.administrative_division_level_4_name || null,
                    postal_code: area.postal_code,
                    full_address: area.name,
                    // Keep original data for reference
                    raw: area
                }))
            };
        }
        return result;
    },

    async getProvinces(countryCode: string = 'ID') {
        const provinces = [
            { id: "11", name: "Aceh" },
            { id: "51", name: "Bali" },
            { id: "36", name: "Banten" },
            { id: "17", name: "Bengkulu" },
            { id: "75", name: "Gorontalo" },
            { id: "31", name: "Jakarta" },
            { id: "15", name: "Jambi" },
            { id: "32", name: "Jawa Barat" },
            { id: "33", name: "Jawa Tengah" },
            { id: "35", name: "Jawa Timur" },
            { id: "61", name: "Kalimantan Barat" },
            { id: "63", name: "Kalimantan Selatan" },
            { id: "62", name: "Kalimantan Tengah" },
            { id: "64", name: "Kalimantan Timur" },
            { id: "65", name: "Kalimantan Utara" },
            { id: "19", name: "Kepulauan Bangka Belitung" },
            { id: "21", name: "Kepulauan Riau" },
            { id: "18", name: "Lampung" },
            { id: "81", name: "Maluku" },
            { id: "82", name: "Maluku Utara" },
            { id: "52", name: "Nusa Tenggara Barat" },
            { id: "53", name: "Nusa Tenggara Timur" },
            { id: "91", name: "Papua" },
            { id: "92", name: "Papua Barat" },
            { id: "95", name: "Papua Barat Daya" },
            { id: "94", name: "Papua Pegunungan" },
            { id: "93", name: "Papua Selatan" },
            { id: "96", name: "Papua Tengah" },
            { id: "14", name: "Riau" },
            { id: "76", name: "Sulawesi Barat" },
            { id: "73", name: "Sulawesi Selatan" },
            { id: "72", name: "Sulawesi Tengah" },
            { id: "74", name: "Sulawesi Tenggara" },
            { id: "71", name: "Sulawesi Utara" },
            { id: "13", name: "Sumatera Barat" },
            { id: "16", name: "Sumatera Selatan" },
            { id: "12", name: "Sumatera Utara" },
            { id: "34", name: "Yogyakarta" }
        ];
        return {
            success: true,
            data: provinces
        };
    },

    async getCitiesByProvince(provinceName: string) {
        // Search for areas in this province and extract unique cities
        const result = await this.searchArea(provinceName, 'ID');
        if (result.success && result.areas) {
            const uniqueCities = new Map();
            result.areas.forEach((area: any) => {
                if (area.city && !uniqueCities.has(area.city)) {
                    uniqueCities.set(area.city, {
                        id: area.city,
                        name: area.city,
                        province: area.province
                    });
                }
            });
            return {
                success: true,
                data: Array.from(uniqueCities.values())
            };
        }
        return { success: false, data: [] };
    },

    async getDistrictsByCity(cityName: string, provinceName?: string) {
        // Search for areas in this city and extract unique districts
        const searchQuery = provinceName ? `${cityName}, ${provinceName}` : cityName;
        const result = await this.searchArea(searchQuery, 'ID');
        if (result.success && result.areas) {
            const uniqueDistricts = new Map();
            result.areas.forEach((area: any) => {
                if (area.district && !uniqueDistricts.has(area.district)) {
                    uniqueDistricts.set(area.district, {
                        id: area.district,
                        name: area.district,
                        city: area.city,
                        province: area.province
                    });
                }
            });
            return {
                success: true,
                data: Array.from(uniqueDistricts.values())
            };
        }
        return { success: false, data: [] };
    },

    async getAreasByDistrict(districtName: string, cityName?: string, provinceName?: string) {
        // Search for specific areas in this district
        let searchQuery = districtName;
        if (cityName) searchQuery += `, ${cityName}`;
        if (provinceName) searchQuery += `, ${provinceName}`;

        const result = await this.searchArea(searchQuery, 'ID');
        if (result.success && result.areas) {
            return {
                success: true,
                data: result.areas.map((area: any) => ({
                    id: area.id,
                    name: area.full_address,
                    area: area.area,
                    district: area.district,
                    city: area.city,
                    province: area.province,
                    postal_code: area.postal_code
                }))
            };
        }
        return { success: false, data: [] };
    },

    // Legacy compatibility methods
    async getCities(provinceName: string) {
        return this.getCitiesByProvince(provinceName);
    },

    async getSuburbs(cityName: string) {
        return this.getDistrictsByCity(cityName);
    },

    async getAreas(districtName: string) {
        return this.getAreasByDistrict(districtName);
    }
}

// Keep old name for backward compatibility
export const shipperService = biteshipService;
