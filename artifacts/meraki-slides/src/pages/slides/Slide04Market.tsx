export default function Slide04Market() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col px-[7vw] py-[7vh]" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Header */}
      <div className="mb-[4vh]">
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase mb-[1.5vh]" style={{ color: "#8B7567" }}>
          Market Opportunity
        </div>
        <div className="text-[3.6vw] font-display font-bold leading-tight" style={{ color: "#2D2926", textWrap: "balance" }}>
          A large, underserved market at a digital inflection point
        </div>
        <div className="mt-[2.5vh] w-[6vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
      </div>

      {/* Stats grid */}
      <div className="flex gap-[2.5vw] flex-1 items-center">
        {/* Hero stat */}
        <div className="flex-[1.3] flex flex-col justify-center px-[2.5vw] py-[3vh]" style={{ backgroundColor: "#C1622F" }}>
          <div className="text-[9vw] font-display font-black leading-none" style={{ color: "#FFFFFF" }}>5M+</div>
          <div className="mt-[1.5vh] text-[2vw] font-body font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
            Addis Ababa population
          </div>
          <div className="mt-[1vh] text-[1.7vw] font-body" style={{ color: "rgba(255,255,255,0.65)" }}>
            East Africa's fastest-growing capital
          </div>
        </div>

        {/* Secondary stats column */}
        <div className="flex-1 flex flex-col gap-[2.5vh]">
          <div className="px-[2vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
            <div className="text-[4.5vw] font-display font-black leading-none" style={{ color: "#C1622F" }}>500K+</div>
            <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#2D2926" }}>domestic workers in Ethiopia</div>
            <div className="mt-[0.5vh] text-[1.7vw] font-body" style={{ color: "#8B7567" }}>95% operating informally</div>
          </div>
          <div className="px-[2vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
            <div className="text-[4.5vw] font-display font-black leading-none" style={{ color: "#C1622F" }}>67%</div>
            <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#2D2926" }}>smartphone penetration growth</div>
            <div className="mt-[0.5vh] text-[1.7vw] font-body" style={{ color: "#8B7567" }}>urban Ethiopia, 2020–2025</div>
          </div>
        </div>

        {/* Tertiary stats column */}
        <div className="flex-1 flex flex-col gap-[2.5vh]">
          <div className="px-[2vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
            <div className="text-[4.5vw] font-display font-black leading-none" style={{ color: "#C1622F" }}>$2B+</div>
            <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#2D2926" }}>informal domestic services market</div>
            <div className="mt-[0.5vh] text-[1.7vw] font-body" style={{ color: "#8B7567" }}>Ethiopia — unstructured, addressable</div>
          </div>
          <div className="px-[2vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
            <div className="text-[4.5vw] font-display font-black leading-none" style={{ color: "#C1622F" }}>3M+</div>
            <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#2D2926" }}>urban middle-class households</div>
            <div className="mt-[0.5vh] text-[1.7vw] font-body" style={{ color: "#8B7567" }}>primary target segment</div>
          </div>
        </div>
      </div>
    </div>
  );
}
