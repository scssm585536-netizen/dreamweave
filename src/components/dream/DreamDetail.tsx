import { Dream } from '@/types'
import { formatDreamDate } from '@/lib/dream'

export default function DreamDetail({ dream }: { dream: Dream }) {
  return (
    <div className="space-y-8">
      <p className="text-gray-600 text-sm">{formatDreamDate(dream.created_at)}</p>

      {dream.image_url && (
        <img src={dream.image_url} alt="꿈 이미지" className="w-full rounded-2xl object-cover max-h-80" />
      )}

      <div>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-3">꿈 내용</h2>
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{dream.content}</p>
      </div>

      {dream.interpretation && (
        <div className="bg-white/[0.03] border border-purple-800/30 rounded-2xl p-6">
          <h2 className="text-xs text-purple-400 uppercase tracking-widest mb-3">🔮 AI 해석 (Jung 심리학)</h2>
          <p className="text-gray-300 leading-relaxed italic">{dream.interpretation}</p>
        </div>
      )}

      {dream.emotions && dream.emotions.length > 0 && (
        <div>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-3">감정</h2>
          <div className="flex flex-wrap gap-2">
            {dream.emotions.map((e) => (
              <span key={e} className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-800/30">{e}</span>
            ))}
          </div>
        </div>
      )}

      {dream.keywords && dream.keywords.length > 0 && (
        <div>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-3">핵심 상징</h2>
          <div className="flex flex-wrap gap-2">
            {dream.keywords.map((k) => (
              <span key={k} className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-800/30">#{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
