'use client'
import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { Mesh, Vector3 } from 'three'
import { WeaveNode, WeaveEdge } from '@/types'

// 꿈 노드
function Node({
  node,
  isNew,
  onClick,
}: {
  node: WeaveNode & { color?: string }
  isNew: boolean
  onClick: () => void
}) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const color = (node as any).color ?? '#818cf8'

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const pulse = Math.sin(t * 2 + node.x) * 0.06
    const scale = hovered ? 1.6 : isNew ? 1.3 + Math.sin(t * 8) * 0.3 : 1 + pulse
    meshRef.current.scale.setScalar(scale)
    if (isNew && meshRef.current.material) {
      const mat = meshRef.current.material as any
      mat.emissiveIntensity = 1.5 + Math.sin(t * 10) * 0.5
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[node.x, node.y, node.z]}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      <sphereGeometry args={[1.2, 20, 20]} />
      <meshStandardMaterial
        color={isNew ? '#e879f9' : color}
        emissive={isNew ? '#c026d3' : color}
        emissiveIntensity={isNew ? 2 : hovered ? 1.5 : 0.6}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}

// 연결선
function Edge({ edge, nodes, isNew }: { edge: WeaveEdge; nodes: WeaveNode[]; isNew: boolean }) {
  const src = nodes.find((n) => n.id === edge.source)
  const tgt = nodes.find((n) => n.id === edge.target)
  if (!src || !tgt) return null

  const opacity = isNew ? 0.9 : 0.15 + edge.similarity * 0.6
  const width = isNew ? 2.5 : 0.8 + edge.similarity * 2.5
  const color = isNew ? '#e879f9' : edge.similarity > 0.85 ? '#c4b5fd' : '#818cf8'

  return (
    <Line
      points={[[src.x, src.y, src.z], [tgt.x, tgt.y, tgt.z]]}
      color={color}
      lineWidth={width}
      transparent
      opacity={opacity}
    />
  )
}

// 몽환적 별 (반짝임)
function TwinkleStar({ position, delay }: { position: [number, number, number]; delay: number }) {
  const meshRef = useRef<Mesh>(null)
  const size = useMemo(() => 0.04 + Math.random() * 0.12, [])
  const color = useMemo(() => {
    const colors = ['#ffffff', '#e0e7ff', '#ddd6fe', '#fce7f3', '#bfdbfe']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime + delay
    const twinkle = 0.3 + Math.abs(Math.sin(t * 1.5)) * 0.7
    const mat = meshRef.current.material as any
    mat.opacity = twinkle
    meshRef.current.scale.setScalar(0.8 + Math.sin(t * 2) * 0.2)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}

// 성운 (부드러운 빛 덩어리)
function Nebula({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime * 0.2
    meshRef.current.rotation.x = t * 0.1
    meshRef.current.rotation.y = t * 0.15
    const mat = meshRef.current.material as any
    mat.opacity = 0.03 + Math.sin(t) * 0.01
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[30 + Math.random() * 20, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.04} wireframe />
    </mesh>
  )
}

// 혜성
function Comet() {
  const ref = useRef<Mesh>(null)
  const speed = useMemo(() => 0.3 + Math.random() * 0.4, [])
  const startPos = useMemo(() => new Vector3(
    -150 + Math.random() * 100,
    50 + Math.random() * 80,
    -50 + Math.random() * 100
  ), [])
  const direction = useMemo(() => new Vector3(
    1.5 + Math.random(),
    -0.8 - Math.random() * 0.5,
    0.2 + Math.random() * 0.3
  ).normalize(), [])

  const trailPoints = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const t = i / 12
      return [
        startPos.x - direction.x * t * 20,
        startPos.y - direction.y * t * 20,
        startPos.z - direction.z * t * 20,
      ] as [number, number, number]
    })
  }, [startPos, direction])

  const [trailStart, setTrailStart] = useState(startPos.clone())
  const [trailEnd, setTrailEnd] = useState(
    startPos.clone().add(direction.clone().multiplyScalar(-15))
  )
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    if (!ref.current) return
    elapsed.current += delta * speed

    // 화면 밖 나가면 리셋
    if (elapsed.current > 8) elapsed.current = 0

    const pos = startPos.clone().add(direction.clone().multiplyScalar(elapsed.current * 30))
    ref.current.position.copy(pos)

    setTrailStart(pos.clone())
    setTrailEnd(pos.clone().add(direction.clone().multiplyScalar(-18)))
  })

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>
      <Line
        points={[
          [trailStart.x, trailStart.y, trailStart.z],
          [trailEnd.x, trailEnd.y, trailEnd.z],
        ]}
        color="#c4b5fd"
        lineWidth={1}
        transparent
        opacity={0.4}
      />
    </>
  )
}

// 떠다니는 먼지 파티클
function DustParticle({ position, delay }: { position: [number, number, number]; delay: number }) {
  const meshRef = useRef<Mesh>(null)
  const originY = position[1]

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime + delay
    meshRef.current.position.y = originY + Math.sin(t * 0.5) * 3
    meshRef.current.position.x = position[0] + Math.cos(t * 0.3) * 2
    const mat = meshRef.current.material as any
    mat.opacity = 0.1 + Math.abs(Math.sin(t * 0.8)) * 0.3
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 4, 4]} />
      <meshBasicMaterial color="#ddd6fe" transparent opacity={0.2} />
    </mesh>
  )
}

// 배경 전체
function Background() {
  // 별 위치 고정
  const stars = useMemo(() => Array.from({ length: 300 }, (_, i) => ({
    position: [
      (Math.sin(i * 137.5) * 0.5) * 350,
      (Math.cos(i * 97.3) * 0.5) * 350,
      (Math.sin(i * 73.1) * 0.5) * 350,
    ] as [number, number, number],
    delay: i * 0.1,
  })), [])

  // 먼지 파티클
  const dust = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    position: [
      (Math.sin(i * 53.7) * 0.5) * 120,
      (Math.cos(i * 41.3) * 0.5) * 120,
      (Math.sin(i * 67.9) * 0.5) * 120,
    ] as [number, number, number],
    delay: i * 0.3,
  })), [])

  return (
    <>
      {/* 반짝이는 별들 */}
      {stars.map((s, i) => (
        <TwinkleStar key={i} position={s.position} delay={s.delay} />
      ))}

      {/* 성운 */}
      <Nebula position={[40, 20, -60]} color="#7c3aed" />
      <Nebula position={[-60, -30, -40]} color="#4338ca" />
      <Nebula position={[0, 60, -80]} color="#be185d" />
      <Nebula position={[-40, 40, 30]} color="#0e7490" />

      {/* 먼지 파티클 */}
      {dust.map((d, i) => (
        <DustParticle key={i} position={d.position} delay={d.delay} />
      ))}

      {/* 혜성 3개 */}
      <Comet />
      <Comet />
      <Comet />
    </>
  )
}

export default function WeaveCanvas({
  nodes,
  edges,
  newNodeIds,
  onNodeClick,
}: {
  nodes: WeaveNode[]
  edges: WeaveEdge[]
  newNodeIds: Set<string>
  onNodeClick: (node: WeaveNode) => void
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 100], fov: 60 }}
      style={{ width: '100%', height: '100vh', background: 'linear-gradient(135deg, #070712 0%, #0d0a1e 50%, #070712 100%)' }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[30, 30, 30]} intensity={2} color="#a855f7" />
      <pointLight position={[-30, -30, -30]} intensity={1} color="#6366f1" />
      <pointLight position={[0, 50, 0]} intensity={0.8} color="#e879f9" />
      <pointLight position={[0, -50, 0]} intensity={0.3} color="#0ea5e9" />

      <Background />

      {nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          isNew={newNodeIds.has(node.id)}
          onClick={() => onNodeClick(node)}
        />
      ))}

      {edges.map((edge, i) => (
        <Edge
          key={i}
          edge={edge}
          nodes={nodes}
          isNew={newNodeIds.has(edge.source) || newNodeIds.has(edge.target)}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.4}
        zoomSpeed={0.8}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </Canvas>
  )
}
