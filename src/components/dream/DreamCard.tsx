import Link from 'next/link'
import { Dream } from '@/types'
import { formatDreamDate, previewContent } from '@/lib/dream'

export default function DreamCard({ dream }: { dream: Dream }) {
  const emotions = dream.emotions ?? []
  const scores = dream.emotion_scores ?? {}
  const topEmotions = [...emotions].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0)).slice(0, 3)

  return (
    <Link href={`/dream/${dream.id}`}>
      <div className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-purple-500/30 rounded-2xl p-4 md:p-5 transition-all duration-300 flex gap-3 md:gap-5">
        <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-purple-900/20 border border-purple-900/30 flex items-center justify-center flex-shrink-0 text-xl md:text-2xl">
          🌙
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1.5 md:mb-2 gap-2">
            <p className="text-xs text-gray-600">{formatDreamDate(dream.created_at)}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {dream.main_tag && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium hidden md:inline">
                  ✦ {dream.main_tag}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                dream.visibility === 'private' ? 'border-white/5 text-gray-600'
                : dream.visibility === 'anonymous' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5'
                : 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5'
              }`}>
                {dream.visibility === 'private' ? '🔒'
                  : dream.visibility === 'anonymous' ? '👤 익명'
                  : '🌐 공개'}
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-2 md:mb-3 group-hover:text-gray-200 transition line-clamp-2">
            {previewContent(dream.content)}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {topEmotions.map((e, i) => (
              <span key={e} className={`text-xs px-2 py-0.5 rounded-full border ${
                i === 0
                  ? 'bg-purple-600/20 text-purple-200 border-purple-500/40'
                  : 'bg-purple-900/30 text-purple-300/80 border-purple-800/30'
              }`}>
                {i === 0 && '✦ '}{e}{scores[e] ? ` ${scores[e]}%` : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center text-gray-700 group-hover:text-purple-400 transition text-lg flex-shrink-0 self-center">→</div>
      </div>
    </Link>
  )
}
