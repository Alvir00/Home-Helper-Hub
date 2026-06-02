export default function Slide06SocialImpact() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex" style={{ backgroundColor: "#2D2926" }}>
      {/* Left: quote and mission */}
      <div className="w-[48%] h-full flex flex-col justify-between px-[5vw] py-[7vh]">
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase" style={{ color: "#D4935A" }}>
          Social Impact
        </div>

        <div>
          <div
            className="text-[3.2vw] font-display font-bold leading-tight"
            style={{ color: "#FFFFFF", textWrap: "balance" }}
          >
            "Dignified work is a fundamental right. Meraki makes it a business model."
          </div>
          <div className="mt-[3vh] w-[6vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
          <div className="mt-[3vh] text-[2vw] font-body leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", textWrap: "pretty" }}>
            Domestic work is Ethiopia's largest informal employment sector. We formalize it — with fair wages, contracts, training, and healthcare access.
          </div>
        </div>

        <div className="text-[1.6vw] font-body" style={{ color: "rgba(255,255,255,0.35)" }}>
          SDG 8 · Decent Work and Economic Growth
        </div>
      </div>

      {/* Right: impact pillars */}
      <div className="flex-1 h-full flex flex-col justify-center px-[3vw] gap-[2.5vh]" style={{ backgroundColor: "#1E1A17" }}>
        {/* Pillar 1 */}
        <div className="px-[2.5vw] py-[3vh]" style={{ borderLeft: "0.45vw solid #C1622F" }}>
          <div className="text-[3.5vw] font-display font-black leading-none mb-[1vh]" style={{ color: "#C1622F" }}>
            Fair Pay
          </div>
          <div className="text-[1.9vw] font-body" style={{ color: "rgba(255,255,255,0.75)" }}>
            Workers earn 30–50% above the informal sector average. Transparent pricing, instant mobile payouts.
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="px-[2.5vw] py-[3vh]" style={{ borderLeft: "0.45vw solid #C1622F" }}>
          <div className="text-[3.5vw] font-display font-black leading-none mb-[1vh]" style={{ color: "#C1622F" }}>
            Formal Status
          </div>
          <div className="text-[1.9vw] font-body" style={{ color: "rgba(255,255,255,0.75)" }}>
            Every worker is registered, insured, and issued a digital employment record — a first for most.
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="px-[2.5vw] py-[3vh]" style={{ borderLeft: "0.45vw solid #C1622F" }}>
          <div className="text-[3.5vw] font-display font-black leading-none mb-[1vh]" style={{ color: "#C1622F" }}>
            Skills &amp; Growth
          </div>
          <div className="text-[1.9vw] font-body" style={{ color: "rgba(255,255,255,0.75)" }}>
            Structured training, performance ratings, and a career ladder from helper to team lead — built into the platform.
          </div>
        </div>
      </div>
    </div>
  );
}
