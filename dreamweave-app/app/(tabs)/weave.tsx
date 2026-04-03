import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import Svg, { Circle, Line } from 'react-native-svg'

const { width, height } = Dimensions.get('window')
const W = width
const H = height * 0.75

interface Node {
  id: string
  x: number
  y: number
  emotions: string[]
  keywords: string[]
  main_tag: string | null
  color: string
}

interface Edge {
  source: string
  target: string
  similarity: number
}

const TAG_COLORS: Record<string, string> = {
  불안: '#ef4444', 기쁨: '#22c55e', 슬픔: '#60a5fa',
  설렘: '#fbbf24', 평온: '#22d3ee', 혼란: '#f472b6',
  사랑: '#fb7185', 변화: '#a78bfa', 자연: '#34d399',
  default: '#818cf8',
}

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function getCanvasSize(count: number) {
  const base = Math.max(W, H) + 200
  const extra = Math.ceil(count / 10) * 200
  return base + extra
}

function forceLayout(nodes: any[], edges: any[], canvasSize: number) {
  const pos: Record<string, { x: number; y: number }> = {}
  const margin = 80
  nodes.forEach((n, i) => {
    const seed = n.id.charCodeAt(0) + n.id.charCodeAt(1) + i
    pos[n.id] = {
      x: margin + sr(seed) * (canvasSize - margin * 2),
      y: margin + sr(seed + 1) * (canvasSize - margin * 2),
    }
  })
  for (let iter = 0; iter < 40; iter++) {
    const forces: Record<string, { x: number; y: number }> = {}
    nodes.forEach((n) => { forces[n.id] = { x: 0, y: 0 } })
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        const dx = pos[a.id].x - pos[b.id].x
        const dy = pos[a.id].y - pos[b.id].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const rep = 8000 / (dist * dist)
        forces[a.id].x += (dx / dist) * rep
        forces[a.id].y += (dy / dist) * rep
        forces[b.id].x -= (dx / dist) * rep
        forces[b.id].y -= (dy / dist) * rep
      }
    }
    edges.forEach((e) => {
      const pa = pos[e.source], pb = pos[e.target]
      if (!pa || !pb) return
      const dx = pb.x - pa.x
      const dy = pb.y - pa.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const att = dist * e.similarity * 0.008
      forces[e.source].x += (dx / dist) * att
      forces[e.source].y += (dy / dist) * att
      forces[e.target].x -= (dx / dist) * att
      forces[e.target].y -= (dy / dist) * att
    })
    const damping = 0.5 * (1 - iter / 40)
    nodes.forEach((n) => {
      pos[n.id].x = Math.max(margin, Math.min(canvasSize - margin, pos[n.id].x + forces[n.id].x * damping))
      pos[n.id].y = Math.max(margin, Math.min(canvasSize - margin, pos[n.id].y + forces[n.id].y * damping))
    })
  }
  return pos
}

export default function WeaveScreen() {
  const router = useRouter()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selected, setSelected] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)
  const [canvasSize, setCanvasSize] = useState(W + 200)
  const [scale, setScale] = useState(1)

  useEffect(() => { fetchWeave() }, [])

  async function fetchWeave() {
    const { data: dreams } = await supabase
      .from('dreams')
      .select('id, emotions, keywords, main_tag')
      .neq('visibility', 'private')
      .limit(500)
    const { data: connections } = await supabase
      .from('dream_connections')
      .select('dream_a, dream_b, similarity')
    const dreamList = dreams ?? []
    const edgeList: Edge[] = (connections ?? []).map((c) => ({
      source: c.dream_a, target: c.dream_b, similarity: c.similarity,
    }))
    const cs = getCanvasSize(dreamList.length)
    setCanvasSize(cs)
    const pos = forceLayout(dreamList, edgeList, cs)
    const nodeList: Node[] = dreamList.map((d) => ({
      id: d.id,
      x: pos[d.id]?.x ?? cs / 2,
      y: pos[d.id]?.y ?? cs / 2,
      emotions: d.emotions ?? [],
      keywords: d.keywords ?? [],
      main_tag: d.main_tag,
      color: TAG_COLORS[d.main_tag ?? ''] ?? TAG_COLORS.default,
    }))
    setNodes(nodeList)
    setEdges(edgeList)
    setLoading(false)
  }

  const stars = Array.from({ length: 150 }, (_, i) => ({
    cx: sr(i * 7) * canvasSize,
    cy: sr(i * 13) * canvasSize,
    r: sr(i * 3) * 1.5 + 0.3,
    opacity: sr(i * 17) * 0.7 + 0.2,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧵 꿈 직물</Text>
        <Text style={styles.count}>{nodes.length}개 연결됨</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🧵</Text>
          <Text style={styles.loadingText}>직물을 불러오는 중...</Text>
        </View>
      ) : nodes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌙</Text>
          <Text style={styles.emptyText}>아직 연결된 꿈이 없어요</Text>
          <TouchableOpacity style={styles.recordBtn} onPress={() => router.push('/(tabs)/new-dream')}>
            <Text style={styles.recordBtnText}>꿈 기록하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          style={styles.hScroll}
          contentContainerStyle={{ width: canvasSize * scale }}
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          <ScrollView
            style={{ width: canvasSize * scale }}
            contentContainerStyle={{ height: canvasSize * scale }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* SVG 배경 + 선 */}
            <Svg
              width={canvasSize * scale}
              height={canvasSize * scale}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
              viewBox={`0 0 ${canvasSize} ${canvasSize}`}
            >
              {stars.map((s, i) => (
                <Circle key={`star-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="white" fillOpacity={s.opacity} />
              ))}
              <Circle cx={canvasSize * 0.2} cy={canvasSize * 0.2} r={canvasSize * 0.12} fill="#7c3aed" fillOpacity={0.05} />
              <Circle cx={canvasSize * 0.8} cy={canvasSize * 0.7} r={canvasSize * 0.1} fill="#4338ca" fillOpacity={0.06} />
              <Circle cx={canvasSize * 0.5} cy={canvasSize * 0.5} r={canvasSize * 0.08} fill="#be185d" fillOpacity={0.04} />
              {edges.map((edge, i) => {
                const src = nodes.find((n) => n.id === edge.source)
                const tgt = nodes.find((n) => n.id === edge.target)
                if (!src || !tgt) return null
                return (
                  <Line key={`edge-${i}`}
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke="#a78bfa"
                    strokeWidth={1 + edge.similarity * 3}
                    strokeOpacity={0.3 + edge.similarity * 0.4}
                  />
                )
              })}
            </Svg>

            {/* 노드 버튼 — 절대좌표로 배치 */}
            {nodes.map((node) => {
              const isSelected = selected?.id === node.id
              return (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeBtn,
                    {
                      left: node.x * scale - 22,
                      top: node.y * scale - 22,
                      backgroundColor: node.color,
                      shadowColor: node.color,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: 'white',
                      transform: [{ scale: isSelected ? 1.3 : 1 }],
                    },
                  ]}
                  onPress={() => setSelected(prev => prev?.id === node.id ? null : node)}
                  activeOpacity={0.8}
                />
              )
            })}
          </ScrollView>
        </ScrollView>
      )}

      {/* 팝업 */}
      {selected && (
        <View style={styles.popup}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.popupLabel}>연결된 꿈</Text>
          {selected.main_tag && (
            <View style={styles.mainTagBadge}>
              <Text style={styles.mainTagText}>✦ {selected.main_tag}</Text>
            </View>
          )}
          <View style={styles.popupTags}>
            {selected.emotions.slice(0, 3).map((e) => (
              <View key={e} style={styles.emotionTag}>
                <Text style={styles.emotionText}>{e}</Text>
              </View>
            ))}
          </View>
          <View style={styles.popupTags}>
            {selected.keywords.slice(0, 3).map((k) => (
              <View key={k} style={styles.keywordTag}>
                <Text style={styles.keywordText}>#{k}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => { setSelected(null); router.push(`/dream/${selected.id}`) }}
          >
            <Text style={styles.detailBtnText}>꿈 상세 보기 →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 줌 버튼 */}
      <View style={styles.zoomBtns}>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={() => setScale(s => Math.min(3, s + 0.3))}
        >
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.zoomLevel}>{Math.round(scale * 100)}%</Text>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={() => setScale(s => Math.max(0.3, s - 0.3))}
        >
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>스크롤: 이동 · 탭: 꿈 확인 · +/-: 줌</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  title: { color: 'white', fontSize: 20, fontWeight: '900' },
  count: { color: '#6b7280', fontSize: 13 },
  hScroll: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 40, marginBottom: 12 },
  loadingText: { color: '#a78bfa', fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#6b7280', fontSize: 16, marginBottom: 24 },
  recordBtn: { backgroundColor: '#7c3aed', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12 },
  recordBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  nodeBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  popup: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#0f0f1f', borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)', borderRadius: 20, padding: 20, zIndex: 20 },
  closeBtn: { position: 'absolute', top: 12, right: 16, zIndex: 21 },
  closeText: { color: '#6b7280', fontSize: 24 },
  popupLabel: { color: '#6b7280', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  mainTagBadge: { backgroundColor: 'rgba(147,51,234,0.2)', borderWidth: 1, borderColor: 'rgba(147,51,234,0.4)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  mainTagText: { color: '#c4b5fd', fontSize: 13, fontWeight: '600' },
  popupTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  emotionTag: { backgroundColor: 'rgba(107,70,193,0.3)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  emotionText: { color: '#c4b5fd', fontSize: 12 },
  keywordTag: { backgroundColor: 'rgba(67,56,202,0.3)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  keywordText: { color: '#a5b4fc', fontSize: 12 },
  detailBtn: { backgroundColor: '#7c3aed', borderRadius: 20, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  detailBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  zoomBtns: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: 'rgba(15,15,31,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    gap: 4,
    zIndex: 15,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124,58,237,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: { color: 'white', fontSize: 20, fontWeight: '700', lineHeight: 24 },
  zoomLevel: { color: '#6b7280', fontSize: 11, marginVertical: 2 },
  hint: { position: 'absolute', bottom: 6, alignSelf: 'center', color: '#374151', fontSize: 11 },
})
