export default function Header() {
    return (
      <div className="flex mt-6 
        min-w-[84vw] 
        min-h-[70px] 
        rounded-full 
        items-center 
        justify-center 
        p-4 
        bg-[#F4F7FA]/20
        backdrop-blur-xl
        backdrop-saturate-150
        rounded-3xl
        border border-[#F4F7FA]/30
        after:absolute after:inset-0
        after:rounded-3xl
        after:border after:border-[#F4F7FA]/20
        after:pointer-events-none
        shadow-[12px_12px_32px_rgba(0,0,0,0.18)]
        relative overflow-hidden
        before:absolute before:inset-0
        before:bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0)_70%)]
        before:pointer-events-none">
        <img
            src="/logobianco.png"
            alt="Logo Sinersys"
            className="relative z-10 h-12 object-contain"
        />
      </div>
    );
  }
  