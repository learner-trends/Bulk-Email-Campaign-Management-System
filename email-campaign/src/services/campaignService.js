import api from '../api/api'

export const getAllCampaigns   = ()           => api.get('/campaigns')
export const getCampaignById   = (id)         => api.get(`/campaigns/${id}`)
export const createCampaign    = (data)       => api.post('/campaigns', data)
export const updateCampaign    = (id, data)   => api.put(`/campaigns/${id}`, data)
export const deleteCampaign    = (id)         => api.delete(`/campaigns/${id}`)
export const scheduleCampaign  = (id)         => api.post(`/campaigns/${id}/schedule`)
export const executeCampaign   = (id)         => api.post(`/campaigns/${id}/execute`)
export const getDeliveryLogs   = (id)         => api.get(`/campaigns/${id}/delivery-logs`)
