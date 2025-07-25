import apiService from './apiService'

export default {
  // 使用者 CRUD
  create(data) {
    return apiService.http.post('/users', data)
  },
  getAll() {
    return apiService.httpAuth.get('/users')
  },
  get(id) {
    return apiService.httpAuth.get(`/users/${id}`)
  },
  update(id, data) {
    return apiService.httpAuth.put(`/users/${id}`, data)
  },
  remove(id) {
    return apiService.httpAuth.delete(`/users/${id}`)
  },
  // 個人資料
  getMe() {
    return apiService.httpAuth.get('/users/me')
  },
  updateMe(data) {
    return apiService.httpAuth.put('/users/me', data)
  },
  deleteMe() {
    return apiService.httpAuth.delete('/users/me')
  },
  // 認證
  login(data) {
    return apiService.http.post('/users/login', data)
  },
  logout() {
    return apiService.httpAuth.post('/users/logout')
  },
  refresh() {
    return apiService.httpAuth.post('/users/refresh')
  },
  // 綁定社群帳號
  bindSocial(provider, data) {
    return apiService.httpAuth.post(`/users/bind/${provider}`, data)
  },
  // OAuth 觸發
  googleAuth() {
    return apiService.http.get('/users/auth/google')
  },
  facebookAuth() {
    return apiService.http.get('/users/auth/facebook')
  },
  discordAuth() {
    return apiService.http.get('/users/auth/discord')
  },
  twitterAuth() {
    return apiService.http.get('/users/auth/twitter')
  },
}
