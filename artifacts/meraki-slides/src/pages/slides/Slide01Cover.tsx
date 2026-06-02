export default function Slide01Cover() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex">
      {/* Left terracotta panel */}
      <div className="w-[42%] h-full flex flex-col justify-between px-[4vw] py-[7vh]" style={{ backgroundColor: "#C1622F" }}>
        <div className="text-[1.5vw] font-body font-normal tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.55)" }}>
          Addis Ababa, Ethiopia
        </div>
        <div>
          <div
            className="text-[9vw] font-display font-black leading-none tracking-tighter"
            style={{ color: "#FFFFFF", textWrap: "balance" }}
          >
            meraki
          </div>
          <div className="mt-[2.5vh] text-[2.2vw] font-body" style={{ color: "rgba(255,255,255,0.75)", textWrap: "balance" }}>
            Your home, perfectly kept.
          </div>
        </div>
        <div className="text-[1.6vw] font-body" style={{ color: "rgba(255,255,255,0.45)" }}>
          Seed Round · 2026
        </div>
      </div>

      {/* Divider strip */}
      <div className="w-[0.4vw] h-full" style={{ backgroundColor: "#A84E24" }} />

      {/* Right panel */}
      <div className="flex-1 h-full flex flex-col justify-center px-[5vw] py-[7vh]" style={{ backgroundColor: "#FAF7F4" }}>
        <div className="text-[1.6vw] font-body font-normal tracking-[0.2em] uppercase mb-[4vh]" style={{ color: "#8B7567" }}>
          Investor Presentation
        </div>
        <div
          className="text-[3.4vw] font-display font-bold leading-tight"
          style={{ color: "#2D2926", textWrap: "balance" }}
        >
          On-demand home cleaning and laundry for urban households
        </div>
        <div className="mt-[3vh] w-[7vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
        <div
          className="mt-[3vh] text-[2vw] font-body leading-relaxed"
          style={{ color: "#8B7567", textWrap: "pretty" }}
        >
          Meraki connects Addis Ababa households with vetted, trained home help workers — fast, reliable, and fairly priced.
        </div>
        <div className="mt-[4vh] text-[1.7vw] font-body" style={{ color: "#C1622F" }}>
          meraki.et
        </div>
      </div>
    </div>
  );
}
