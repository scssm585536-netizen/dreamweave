import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070712] text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] rounded-full bg-purple-900/25 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* 네비바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧵</span>
          <span className="font-bold text-sm tracking-wide">DreamWeave</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth?mode=login"
            className="px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            로그인
          </Link>
          <Link
            href="/auth?mode=signup"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-600 hover:bg-purple-500 transition-all duration-200 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
          >
            회원가입
          </Link>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs tracking-widest uppercase mb-8 md:mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          AI 꿈 직조기 · 2026
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-4 md:mb-6 leading-none tracking-tight">
          <span className="block text-white">Dream</span>
          <span className="block bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">Weave</span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg mb-2 md:mb-3 max-w-xl mx-auto">아침에 꿈만 쓰면,</p>
        <p className="text-purple-200/80 text-lg md:text-xl italic leading-relaxed mb-10 md:mb-14 max-w-xl mx-auto px-4">
          "AI가 내 꿈을 전 세계 사람들의 꿈과<br />실시간으로 엮어 하나의 거대한 꿈 직물로 만들어줍니다"
        </p>

        <div className="flex gap-3 md:gap-4 justify-center flex-wrap mb-16 md:mb-24 px-4">
          <Link href="/auth?mode=signup" className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition-all duration-200 shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)]">
            지금 시작하기 →
          </Link>
          <Link href="/weave" className="px-8 py-3.5 rounded-full border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-sm text-gray-300 hover:text-white transition-all duration-200">
            꿈 직물 탐험하기
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04] mx-4 md:mx-0">
          {[
            { icon: '✍️', title: '꿈 기록', desc: '텍스트로 간단하게' },
            { icon: '🔮', title: 'AI 해석', desc: 'Jung 심리학 기반' },
            { icon: '🌐', title: '꿈 직물', desc: '전 세계와 실시간 연결' },
          ].map((f) => (
            <div key={f.title} className="bg-[#070712] px-3 md:px-6 py-6 md:py-8 text-center hover:bg-purple-900/10 transition-all duration-200">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">{f.icon}</div>
              <p className="text-white font-semibold text-xs md:text-sm mb-0.5 md:mb-1">{f.title}</p>
              <p className="text-gray-600 text-xs hidden md:block">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}