export default function Slide09Ask() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex">
      {/* Left: ask details */}
      <div className="w-[55%] h-full flex flex-col justify-between px-[5vw] py-[7vh]" style={{ backgroundColor: "#FAF7F4" }}>
        <div>
          <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase mb-[2vh]" style={{ color: "#8B7567" }}>
            The Ask
          </div>
          <div className="text-[3.6vw] font-display font-bold leading-tight mb-[2.5vh]" style={{ color: "#2D2926", textWrap: "balance" }}>
            Raising $500,000 seed round
          </div>
          <div className="w-[6vw] h-[0.35vh] mb-[3.5vh]" style={{ backgroundColor: "#C1622F" }} />

          <div className="flex flex-col gap-[2.5vh]">
            <div className="flex items-start gap-[2vw]">
              <div className="text-[2.2vw] font-display font-black w-[10vw] shrink-0" style={{ color: "#C1622F" }}>40%</div>
              <div>
                <div className="text-[2vw] font-body font-bold" style={{ color: "#2D2926" }}>Worker acquisition &amp; training</div>
                <div className="text-[1.7vw] font-body" style={{ color: "#8B7567" }}>Onboard 500 workers, run certified training program</div>
              </div>
            </div>
            <div className="h-[0.15vh]" style={{ backgroundColor: "#E8E1D9" }} />
            <div className="flex items-start gap-[2vw]">
              <div className="text-[2.2vw] font-display font-black w-[10vw] shrink-0" style={{ color: "#C1622F" }}>30%</div>
              <div>
                <div className="text-[2vw] font-body font-bold" style={{ color: "#2D2926" }}>Product &amp; engineering</div>
                <div className="text-[1.7vw] font-body" style={{ color: "#8B7567" }}>Mobile apps, payment integration, worker scheduling</div>
              </div>
            </div>
            <div className="h-[0.15vh]" style={{ backgroundColor: "#E8E1D9" }} />
            <div className="flex items-start gap-[2vw]">
              <div className="text-[2.2vw] font-display font-black w-[10vw] shrink-0" style={{ color: "#C1622F" }}>20%</div>
              <div>
                <div className="text-[2vw] font-body font-bold" style={{ color: "#2D2926" }}>Marketing &amp; household growth</div>
                <div className="text-[1.7vw] font-body" style={{ color: "#8B7567" }}>1,000 subscribed households by month 9</div>
              </div>
            </div>
            <div className="h-[0.15vh]" style={{ backgroundColor: "#E8E1D9" }} />
            <div className="flex items-start gap-[2vw]">
              <div className="text-[2.2vw] font-display font-black w-[10vw] shrink-0" style={{ color: "#C1622F" }}>10%</div>
              <div>
                <div className="text-[2vw] font-body font-bold" style={{ color: "#2D2926" }}>Operations &amp; compliance</div>
                <div className="text-[1.7vw] font-body" style={{ color: "#8B7567" }}>Legal, insurance, worker registration</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[1.6vw] font-body" style={{ color: "#8B7567" }}>
          18-month runway to Series A milestones
        </div>
      </div>

      {/* Right: closer panel */}
      <div className="flex-1 h-full flex flex-col justify-between px-[4.5vw] py-[7vh]" style={{ backgroundColor: "#C1622F" }}>
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
          Join Us
        </div>

        <div>
          <div className="text-[8vw] font-display font-black leading-none tracking-tighter" style={{ color: "#FFFFFF" }}>
            meraki
          </div>
          <div className="mt-[2vh] text-[2.2vw] font-body" style={{ color: "rgba(255,255,255,0.8)" }}>
            Your home, perfectly kept.
          </div>
          <div className="mt-[4vh] w-[5vw] h-[0.3vh]" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
          <div className="mt-[4vh] text-[2vw] font-body leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            We are building Ethiopia's first formal home services platform — where households get reliability and workers get dignity.
          </div>
        </div>

        <div className="flex flex-col gap-[1.2vh]">
          <div className="text-[1.8vw] font-body" style={{ color: "rgba(255,255,255,0.9)" }}>hello@meraki.et</div>
          <div className="text-[1.8vw] font-body" style={{ color: "rgba(255,255,255,0.9)" }}>meraki.et</div>
          <div className="text-[1.6vw] font-body" style={{ color: "rgba(255,255,255,0.45)" }}>Addis Ababa, Ethiopia</div>
        </div>
      </div>
    </div>
  );
}
