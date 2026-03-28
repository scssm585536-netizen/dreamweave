import useSWR from 'swr'
import { WeaveNode, WeaveEdge } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useWeave() {
  const { data, error, isLoading } = useSWR('/api/weave', fetcher, {
    refreshInterval: 30000, // 30초마다 새로고침
  })

  return {
    nodes: (data?.nodes ?? []) as WeaveNode[],
    edges: (data?.edges ?? []) as WeaveEdge[],
    isLoading,
    isError: !!error,
  }
}
