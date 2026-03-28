import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// main_tag별 클러스터 중심 계산
function getClusterCenter(tag: string): { x: number; y: number; z: number } {
  const seed = Array.from(tag).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return {
    x: (seededRandom(seed) - 0.5) * 80,
    y: (seededRandom(seed + 1) - 0.5) * 80,
    z: (seededRandom(seed + 2) - 0.5) * 80,
  }
}

function forceLayout(nodes: any[], edges: any[], iterations = 60) {
  const positions: Record<string, { x: number; y: number; z: number }> = {}

  // 초기 위치: main_tag 클러스터 중심 근처에 배치
  nodes.forEach((n, i) => {
    const center = n.main_tag ? getClusterCenter(n.main_tag) : { x: 0, y: 0, z: 0 }
    const seed = n.id.charCodeAt(0) + i
    positions[n.id] = {
      x: center.x + (seededRandom(seed) - 0.5) * 20,
      y: center.y + (seededRandom(seed + 1) - 0.5) * 20,
      z: center.z + (seededRandom(seed + 2) - 0.5) * 20,
    }
  })

  for (let iter = 0; iter < iterations; iter++) {
    const forces: Record<string, { x: number; y: number; z: number }> = {}
    nodes.forEach((n) => { forces[n.id] = { x: 0, y: 0, z: 0 } })

    // 반발력
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const pa = positions[a.id]
        const pb = positions[b.id]
        const dx = pa.x - pb.x
        const dy = pa.y - pb.y
        const dz = pa.z - pb.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1
        const repulse = 150 / (dist * dist)
        forces[a.id].x += (dx / dist) * repulse
        forces[a.id].y += (dy / dist) * repulse
        forces[a.id].z += (dz / dist) * repulse
        forces[b.id].x -= (dx / dist) * repulse
        forces[b.id].y -= (dy / dist) * repulse
        forces[b.id].z -= (dz / dist) * repulse
      }
    }

    // 인력 (연결된 꿈끼리)
    edges.forEach((e) => {
      const pa = positions[e.source]
      const pb = positions[e.target]
      if (!pa || !pb) return
      const dx = pb.x - pa.x
      const dy = pb.y - pa.y
      const dz = pb.z - pa.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1
      const attract = dist * e.similarity * 0.008
      forces[e.source].x += (dx / dist) * attract
      forces[e.source].y += (dy / dist) * attract
      forces[e.source].z += (dz / dist) * attract
      forces[e.target].x -= (dx / dist) * attract
      forces[e.target].y -= (dy / dist) * attract
      forces[e.target].z -= (dz / dist) * attract
    })

    // 같은 main_tag끼리 추가 인력 (클러스터 형성)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        if (!a.main_tag || a.main_tag !== b.main_tag) continue
        const pa = positions[a.id]
        const pb = positions[b.id]
        const dx = pb.x - pa.x
        const dy = pb.y - pa.y
        const dz = pb.z - pa.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1
        const attract = dist * 0.015
        forces[a.id].x += (dx / dist) * attract
        forces[a.id].y += (dy / dist) * attract
        forces[a.id].z += (dz / dist) * attract
        forces[b.id].x -= (dx / dist) * attract
        forces[b.id].y -= (dy / dist) * attract
        forces[b.id].z -= (dz / dist) * attract
      }
    }

    const damping = 0.5 * (1 - iter / iterations)
    nodes.forEach((n) => {
      positions[n.id].x += forces[n.id].x * damping
      positions[n.id].y += forces[n.id].y * damping
      positions[n.id].z += forces[n.id].z * damping
    })
  }

  return positions
}

// main_tag별 고유 색상
function tagToColor(tag: string): string {
  const colors = [
    '#a855f7', '#6366f1', '#ec4899', '#3b82f6',
    '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16',
  ]
  const seed = Array.from(tag ?? '').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[seed % colors.length]
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: dreams, error } = await supabase
    .from('dreams')
    .select('id, title, content, emotions, keywords, main_tag, visibility')
    .neq('visibility', 'private')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }

  const { data: connections } = await supabase
    .from('dream_connections')
    .select('dream_a, dream_b, similarity')

  const edges = (connections || []).map((c) => ({
    source: c.dream_a,
    target: c.dream_b,
    similarity: c.similarity,
  }))

  const dreamList = dreams || []
  const positions = forceLayout(dreamList, edges, 80)

  const nodes = dreamList.map((d) => ({
    ...d,
    x: positions[d.id]?.x ?? 0,
    y: positions[d.id]?.y ?? 0,
    z: positions[d.id]?.z ?? 0,
    color: tagToColor(d.main_tag ?? '꿈'),
    isMyDream: false,
  }))

  return NextResponse.json({ nodes, edges })
}
