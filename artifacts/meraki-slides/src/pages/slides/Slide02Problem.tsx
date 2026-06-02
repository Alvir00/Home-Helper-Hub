export default function Slide02Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col px-[7vw] py-[7vh]" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Header */}
      <div className="mb-[4vh]">
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase mb-[1.5vh]" style={{ color: "#8B7567" }}>
          The Problem
        </div>
        <div className="text-[4vw] font-display font-bold leading-tight" style={{ color: "#2D2926", textWrap: "balance" }}>
          Urban households in Addis lack reliable, professional home help
        </div>
        <div className="mt-[2.5vh] w-[6vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
      </div>

      {/* Three pain points */}
      <div className="flex gap-[3vw] flex-1 items-stretch">
        {/* Pain 1 */}
        <div className="flex-1 flex flex-col justify-between pt-[3vh] pb-[3vh] pl-[2.5vw] pr-[2vw]" style={{ backgroundColor: "#F0E8DF", borderLeft: "0.4vw solid #C1622F" }}>
          <div className="text-[3.5vw] font-display font-black" style={{ color: "#C1622F" }}>01</div>
          <div>
            <div className="text-[2.2vw] font-display font-bold mb-[1.5vh]" style={{ color: "#2D2926" }}>
              No reliable channel
            </div>
            <div className="text-[1.9vw] font-body leading-relaxed" style={{ color: "#8B7567" }}>
              Households rely on informal referrals and word-of-mouth. Workers appear and disappear with no accountability or consistency.
            </div>
          </div>
        </div>

        {/* Pain 2 */}
        <div className="flex-1 flex flex-col justify-between pt-[3vh] pb-[3vh] pl-[2.5vw] pr-[2vw]" style={{ backgroundColor: "#F0E8DF", borderLeft: "0.4vw solid #C1622F" }}>
          <div className="text-[3.5vw] font-display font-black" style={{ color: "#C1622F" }}>02</div>
          <div>
            <div className="text-[2.2vw] font-display font-bold mb-[1.5vh]" style={{ color: "#2D2926" }}>
              Quality uncertainty
            </div>
            <div className="text-[1.9vw] font-body leading-relaxed" style={{ color: "#8B7567" }}>
              No vetting, no training standards, no way to rate or review. Every booking is a gamble on quality and trustworthiness.
            </div>
          </div>
        </div>

        {/* Pain 3 */}
        <div className="flex-1 flex flex-col justify-between pt-[3vh] pb-[3vh] pl-[2.5vw] pr-[2vw]" style={{ backgroundColor: "#F0E8DF", borderLeft: "0.4vw solid #C1622F" }}>
          <div className="text-[3.5vw] font-display font-black" style={{ color: "#C1622F" }}>03</div>
          <div>
            <div className="text-[2.2vw] font-display font-bold mb-[1.5vh]" style={{ color: "#2D2926" }}>
              Workers left behind
            </div>
            <div className="text-[1.9vw] font-body leading-relaxed" style={{ color: "#8B7567" }}>
              Over 500,000 domestic workers in Ethiopia operate informally — no contracts, no fair wages, no social protection or career path.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
