'use client'
import { useState } from 'react'

type Visibility = 'private' | 'anonymous' | 'public'

interface Props {
  onSubmit: (data: { content: string; visibility: Visibility }) => void
  loading: boolean
}

export default function DreamForm({ onSubmit, loading }: Props) {
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('anonymous')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit({ content, visibility })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3">꿈 내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘 밤, 나는..."
          rows={9}
          className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-purple-500/30 focus:border-purple-500/60 rounded-2xl p-5 text-white text-sm placeholder-gray-700 resize-none focus:outline-none transition-all duration-200 leading-relaxed"
          disabled={loading}
        />
        <p className="text-right text-gray-700 text-xs mt-2">{content.length}자</p>
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3">공개 범위</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'private' as const, icon: '🔒', label: '비공개', desc: '나만 보기' },
            { value: 'anonymous' as const, icon: '👤', label: '익명 공개', desc: '직물에 참여' },
            { value: 'public' as const, icon: '🌐', label: '공개', desc: '닉네임 표시' },
          ]).map((opt) => (
            <button
              key={opt.value} type="button" onClick={() => setVisibility(opt.value)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                visibility === opt.value ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
              }`}
            >
              <div className="text-lg mb-2">{opt.icon}</div>
              <p className="text-sm font-medium text-white mb-0.5">{opt.label}</p>
              <p className="text-xs text-gray-600">{opt.desc}</p>
            </button>
          ))}
        </div>
        {visibility === 'private' && (
          <p className="text-xs text-gray-600 mt-3 pl-1">비공개 꿈은 집단 직물에 연결되지 않아요.</p>
        )}
      </div>

      <button
        type="submit" disabled={loading || !content.trim()}
        className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-sm transition-all duration-200 shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.5)]"
      >
        {loading ? '꿈을 해석하는 중... 🔮' : '꿈 저장하기 →'}
      </button>
    </form>
  )
}
