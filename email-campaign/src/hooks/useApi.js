import { useState, useCallback } from 'react'

/**
 * Wraps an async API call with loading + error state.
 * Usage:
 *   const { run, loading, error } = useApi()
 *   const data = await run(() => campaignService.getAllCampaigns())
 */
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const run = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Something went wrong'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, loading, error }
}
