import useSWR from 'swr'
import { Dream } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useDreams(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/dream/list?userId=${userId}` : null,
    fetcher
  )

  return {
    dreams: (data?.dreams ?? []) as Dream[],
    isLoading,
    isError: !!error,
    mutate,
  }
}
