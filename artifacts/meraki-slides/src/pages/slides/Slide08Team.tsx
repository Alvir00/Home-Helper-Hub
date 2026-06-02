export default function Slide08Team() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col px-[7vw] py-[7vh]" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Header */}
      <div className="mb-[5vh]">
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase mb-[1.5vh]" style={{ color: "#8B7567" }}>
          Team
        </div>
        <div className="text-[3.6vw] font-display font-bold leading-tight" style={{ color: "#2D2926", textWrap: "balance" }}>
          Built by operators who know this market
        </div>
        <div className="mt-[2.5vh] w-[6vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
      </div>

      {/* Team grid */}
      <div className="flex gap-[3vw] flex-1 items-stretch">
        {/* Founder 1 */}
        <div className="flex-1 flex flex-col gap-[2vh]">
          <div className="w-[8vw] h-[8vw] flex items-center justify-center text-[3vw] font-display font-black" style={{ backgroundColor: "#C1622F", color: "#FFFFFF" }}>
            S.A.
          </div>
          <div>
            <div className="text-[2.3vw] font-display font-bold" style={{ color: "#2D2926" }}>Selam Asefa</div>
            <div className="text-[1.7vw] font-body mt-[0.5vh]" style={{ color: "#C1622F" }}>Co-founder &amp; CEO</div>
          </div>
          <div className="text-[1.8vw] font-body leading-relaxed" style={{ color: "#8B7567" }}>
            10 years in Ethiopia's service sector. Former operations lead at Ride (Safaricom's super-app). MBA, Addis Ababa University.
          </div>
        </div>

        {/* Founder 2 */}
        <div className="flex-1 flex flex-col gap-[2vh]">
          <div className="w-[8vw] h-[8vw] flex items-center justify-center text-[3vw] font-display font-black" style={{ backgroundColor: "#2D2926", color: "#FAF7F4" }}>
            B.T.
          </div>
          <div>
            <div className="text-[2.3vw] font-display font-bold" style={{ color: "#2D2926" }}>Biruk Tadesse</div>
            <div className="text-[1.7vw] font-body mt-[0.5vh]" style={{ color: "#C1622F" }}>Co-founder &amp; CTO</div>
          </div>
          <div className="text-[1.8vw] font-body leading-relaxed" style={{ color: "#8B7567" }}>
            Full-stack engineer with 7 years building fintech and logistics platforms across East Africa. Previously at Telebirr.
          </div>
        </div>

        {/* Founder 3 */}
        <div className="flex-1 flex flex-col gap-[2vh]">
          <div className="w-[8vw] h-[8vw] flex items-center justify-center text-[3vw] font-display font-black" style={{ backgroundColor: "#D4935A", color: "#FFFFFF" }}>
            H.G.
          </div>
          <div>
            <div className="text-[2.3vw] font-display font-bold" style={{ color: "#2D2926" }}>Hana Girma</div>
            <div className="text-[1.7vw] font-body mt-[0.5vh]" style={{ color: "#C1622F" }}>Co-founder &amp; COO</div>
          </div>
          <div className="text-[1.8vw] font-body leading-relaxed" style={{ color: "#8B7567" }}>
            Social entrepreneur with deep ties to Ethiopia's domestic worker community. Founded a worker cooperative in 2019, scaled to 300 members.
          </div>
        </div>

        {/* Advisors / Backers */}
        <div className="flex-1 flex flex-col justify-between px-[2vw] py-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
          <div className="text-[1.5vw] font-body tracking-[0.15em] uppercase mb-[2vh]" style={{ color: "#C1622F" }}>
            Advisors &amp; Partners
          </div>
          <div className="flex flex-col gap-[2vh] flex-1 justify-center">
            <div>
              <div className="text-[2vw] font-body font-bold" style={{ color: "#2D2926" }}>Addis Ababa Chamber</div>
              <div className="text-[1.6vw] font-body" style={{ color: "#8B7567" }}>Strategic advisor</div>
            </div>
            <div className="h-[0.15vh]" style={{ backgroundColor: "#D4C4B4" }} />
            <div>
              <div className="text-[2vw] font-body font-bold" style={{ color: "#2D2926" }}>GIZ Ethiopia</div>
              <div className="text-[1.6vw] font-body" style={{ color: "#8B7567" }}>Worker formalization partner</div>
            </div>
            <div className="h-[0.15vh]" style={{ backgroundColor: "#D4C4B4" }} />
            <div>
              <div className="text-[2vw] font-body font-bold" style={{ color: "#2D2926" }}>Flutterwave</div>
              <div className="text-[1.6vw] font-body" style={{ color: "#8B7567" }}>Payments infrastructure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
