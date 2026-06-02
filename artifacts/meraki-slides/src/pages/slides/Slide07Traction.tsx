export default function Slide07Traction() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col px-[7vw] py-[7vh]" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Header */}
      <div className="mb-[4vh]">
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase mb-[1.5vh]" style={{ color: "#8B7567" }}>
          Traction &amp; Roadmap
        </div>
        <div className="text-[3.6vw] font-display font-bold leading-tight" style={{ color: "#2D2926", textWrap: "balance" }}>
          Early signals, clear path to scale
        </div>
        <div className="mt-[2.5vh] w-[6vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
      </div>

      {/* Beta traction stats */}
      <div className="flex gap-[2.5vw] mb-[4vh]">
        <div className="flex-1 px-[2.5vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
          <div className="text-[5vw] font-display font-black leading-none" style={{ color: "#C1622F" }}>320</div>
          <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#2D2926" }}>waitlist households</div>
          <div className="text-[1.6vw] font-body" style={{ color: "#8B7567" }}>Bole &amp; Kazanchis districts</div>
        </div>
        <div className="flex-1 px-[2.5vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
          <div className="text-[5vw] font-display font-black leading-none" style={{ color: "#C1622F" }}>48</div>
          <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#2D2926" }}>workers onboarded</div>
          <div className="text-[1.6vw] font-body" style={{ color: "#8B7567" }}>trained and background-checked</div>
        </div>
        <div className="flex-1 px-[2.5vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
          <div className="text-[5vw] font-display font-black leading-none" style={{ color: "#C1622F" }}>4.7</div>
          <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#2D2926" }}>avg. pilot rating</div>
          <div className="text-[1.6vw] font-body" style={{ color: "#8B7567" }}>across 140 beta bookings</div>
        </div>
        <div className="flex-1 px-[2.5vw] py-[3vh]" style={{ backgroundColor: "#C1622F" }}>
          <div className="text-[5vw] font-display font-black leading-none" style={{ color: "#FFFFFF" }}>88%</div>
          <div className="mt-[1vh] text-[1.9vw] font-body font-bold" style={{ color: "#FFFFFF" }}>repeat booking rate</div>
          <div className="text-[1.6vw] font-body" style={{ color: "rgba(255,255,255,0.65)" }}>within first 30 days</div>
        </div>
      </div>

      {/* Roadmap timeline */}
      <div className="flex gap-[0] flex-1 items-stretch">
        {/* Q1 */}
        <div className="flex-1 flex flex-col pt-[2.5vh] pb-[2vh] px-[2vw]" style={{ borderLeft: "0.35vw solid #C1622F" }}>
          <div className="text-[1.5vw] font-body font-bold tracking-widest uppercase mb-[1.5vh]" style={{ color: "#C1622F" }}>Q3 2026</div>
          <div className="text-[1.8vw] font-body font-bold mb-[0.8vh]" style={{ color: "#2D2926" }}>Full launch · Addis Ababa</div>
          <div className="text-[1.7vw] font-body" style={{ color: "#8B7567" }}>500 active workers, 1,000 household subscribers</div>
        </div>
        {/* Q2 */}
        <div className="flex-1 flex flex-col pt-[2.5vh] pb-[2vh] px-[2vw]" style={{ borderLeft: "0.35vw solid #D4935A" }}>
          <div className="text-[1.5vw] font-body font-bold tracking-widest uppercase mb-[1.5vh]" style={{ color: "#D4935A" }}>Q1 2027</div>
          <div className="text-[1.8vw] font-body font-bold mb-[0.8vh]" style={{ color: "#2D2926" }}>Break-even operations</div>
          <div className="text-[1.7vw] font-body" style={{ color: "#8B7567" }}>5,000 subscribers, positive unit economics</div>
        </div>
        {/* Q3 */}
        <div className="flex-1 flex flex-col pt-[2.5vh] pb-[2vh] px-[2vw]" style={{ borderLeft: "0.35vw solid rgba(139,117,103,0.4)" }}>
          <div className="text-[1.5vw] font-body font-bold tracking-widest uppercase mb-[1.5vh]" style={{ color: "#8B7567" }}>Q4 2027</div>
          <div className="text-[1.8vw] font-body font-bold mb-[0.8vh]" style={{ color: "#2D2926" }}>Second city expansion</div>
          <div className="text-[1.7vw] font-body" style={{ color: "#8B7567" }}>Dire Dawa &amp; Mekelle, Series A raise</div>
        </div>
      </div>
    </div>
  );
}
