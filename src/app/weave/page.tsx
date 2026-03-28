'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { WeaveNode } from '@/types'
import WeaveCanvas from '@/components/weave/WeaveCanvas'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WeavePage() {
  const { data, mutate } = useSWR('/api/weave', fetcher, {
    refreshInterval: 10000,
  })
  const [selectedNode, setSelectedNode] = useState<WeaveNode | null>(null)
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set())
  const prevNodeIds = useRef<Set<string>>(new Set())

  const nodes = data?.nodes ?? []
  const edges = data?.edges ?? []
  const isLoading = !data

  // 새 노드 감지
  useEffect(() => {
    if (!nodes.length) return
    const currentIds = new Set<string>(nodes.map((n: WeaveNode) => n.id))
    const added = new Set<string>(
      [...currentIds].filter((id) => !prevNodeIds.current.has(id))
    )
    if (added.size > 0 && prevNodeIds.current.size > 0) {
      setNewNodeIds(added)
      setTimeout(() => setNewNodeIds(new Set()), 3000)
    }
    prevNodeIds.current = currentIds
  }, [nodes])

  return (
    <div className="relative w-full h-screen bg-[#070712]">

      {/* 상단 네비 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-300 text-sm transition">
            ← 대시보드
          </Link>
          <span className="text-gray-800">|</span>
          <p className="text-white font-semibold text-sm">🧵 꿈 직물 탐험</p>
        </div>

          <div className="flex items-center gap-3">
          {newNodeIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              새로운 꿈이 연결됐어요!
            </div>
          )}
          <div className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-gray-500 text-xs">
            {nodes.length}개의 꿈 연결됨
          </div>
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-pulse">🧵</div>
            <p className="text-purple-400 text-sm">직물을 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 꿈 없을 때 */}
      {!isLoading && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-5xl mb-4">🌙</div>
            <p className="text-gray-400 text-sm mb-4">아직 연결된 꿈이 없어요</p>
            <Link href="/dream/new" className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition">
              첫 꿈 기록하기
            </Link>
          </div>
        </div>
      )}

      {/* 3D 캔버스 */}
      {!isLoading && (
        <WeaveCanvas
          nodes={nodes}
          edges={edges}
          newNodeIds={newNodeIds}
          onNodeClick={setSelectedNode}
        />
      )}

      {/* 노드 클릭 팝업 */}
      {selectedNode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
          <div className="bg-[#0f0f1f]/95 backdrop-blur border border-purple-800/40 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white transition text-lg"
            >
              ×
            </button>

            <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">연결된 꿈</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedNode.keywords?.map((k) => (
                <span key={k} className="text-xs bg-indigo-900/40 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800/30">
                  #{k}
                </span>
              ))}
            </div>

            <Link
              href={`/dream/${selectedNode.id}`}
              className="block w-full text-center py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition"
            >
              꿈 상세 보기 →
            </Link>
          </div>
        </div>
      )}

      {/* 조작 안내 */}
      <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 z-10 text-gray-700 text-xs text-right space-y-0.5 hidden md:block">
        <p>드래그: 회전</p>
        <p>스크롤: 줌</p>
        <p>클릭: 꿈 확인</p>
      </div>

      {/* 모바일 안내 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-gray-700 text-xs md:hidden">
        터치로 회전 · 핀치로 줌
      </div>
    </div>
  )
}