import api from '../api/api'

export const getAllRecipients      = ()       => api.get('/recipients')
export const getRecipientStats     = ()       => api.get('/recipients/stats')
export const deleteRecipient       = (id)     => api.delete(`/recipients/${id}`)
export const unsubscribeRecipient  = (id)     => api.patch(`/recipients/${id}/unsubscribe`)
export const resubscribeRecipient  = (id)     => api.patch(`/recipients/${id}/resubscribe`)

export const uploadCsv = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/recipients/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
