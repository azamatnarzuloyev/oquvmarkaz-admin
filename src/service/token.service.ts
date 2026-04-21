import axios from 'axios'

const BASE_URI = import.meta.env.VITE_API_URL

export const axiosInstance = axios.create({
    baseURL: BASE_URI,
    withCredentials: true,
})

const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('sessionUser')
    window.location.href = '/sign-in'
}

// Request: har so'rovga access token qo'shish
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Response: 401 da refresh token bilan yangilash, muvaffaqiyatsiz bo'lsa logout
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
    failedQueue = []
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
            signOut()
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return axiosInstance(originalRequest)
                })
                .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const { data } = await axios.post(`${BASE_URI}/auth/refresh/`, {
                refresh: refreshToken,
            })
            const newAccess: string = data.access
            localStorage.setItem('token', newAccess)
            processQueue(null, newAccess)
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            return axiosInstance(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError, null)
            signOut()
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    },
)
