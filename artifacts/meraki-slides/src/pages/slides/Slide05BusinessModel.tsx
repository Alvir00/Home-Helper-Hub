export default function Slide05BusinessModel() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col px-[7vw] py-[7vh]" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Header */}
      <div className="mb-[4vh]">
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase mb-[1.5vh]" style={{ color: "#8B7567" }}>
          Business Model
        </div>
        <div className="text-[3.6vw] font-display font-bold leading-tight" style={{ color: "#2D2926", textWrap: "balance" }}>
          Two revenue streams, compounding over time
        </div>
        <div className="mt-[2.5vh] w-[6vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
      </div>

      {/* Two-column model */}
      <div className="flex gap-[3vw] flex-1 items-stretch">
        {/* Stream 1: Subscriptions */}
        <div className="flex-1 flex flex-col pt-[3.5vh] pb-[3vh] px-[3vw]" style={{ backgroundColor: "#2D2926" }}>
          <div className="text-[1.5vw] font-body tracking-[0.15em] uppercase mb-[2vh]" style={{ color: "#D4935A" }}>
            Stream 1
          </div>
          <div className="text-[2.8vw] font-display font-bold mb-[2.5vh]" style={{ color: "#FFFFFF" }}>
            Household Subscriptions
          </div>

          <div className="flex flex-col gap-[2vh] flex-1">
            <div className="flex justify-between items-center pb-[1.5vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              <div>
                <div className="text-[1.9vw] font-body font-bold" style={{ color: "#FFFFFF" }}>Essential</div>
                <div className="text-[1.6vw] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>4 bookings/month</div>
              </div>
              <div className="text-[2.2vw] font-display font-black" style={{ color: "#D4935A" }}>799 ETB</div>
            </div>
            <div className="flex justify-between items-center pb-[1.5vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              <div>
                <div className="text-[1.9vw] font-body font-bold" style={{ color: "#FFFFFF" }}>Premium</div>
                <div className="text-[1.6vw] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>8 bookings/month</div>
              </div>
              <div className="text-[2.2vw] font-display font-black" style={{ color: "#D4935A" }}>1,399 ETB</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[1.9vw] font-body font-bold" style={{ color: "#FFFFFF" }}>Family</div>
                <div className="text-[1.6vw] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>Unlimited bookings</div>
              </div>
              <div className="text-[2.2vw] font-display font-black" style={{ color: "#D4935A" }}>1,999 ETB</div>
            </div>
          </div>

          <div className="mt-[2.5vh] text-[1.7vw] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
            Predictable, recurring monthly revenue
          </div>
        </div>

        {/* Stream 2: Per-booking */}
        <div className="flex-1 flex flex-col pt-[3.5vh] pb-[3vh] px-[3vw]" style={{ backgroundColor: "#C1622F" }}>
          <div className="text-[1.5vw] font-body tracking-[0.15em] uppercase mb-[2vh]" style={{ color: "rgba(255,255,255,0.6)" }}>
            Stream 2
          </div>
          <div className="text-[2.8vw] font-display font-bold mb-[2.5vh]" style={{ color: "#FFFFFF" }}>
            Per-booking Commission
          </div>

          <div className="flex flex-col gap-[2.5vh] flex-1 justify-center">
            <div>
              <div className="text-[6vw] font-display font-black leading-none" style={{ color: "#FFFFFF" }}>20%</div>
              <div className="mt-[1vh] text-[1.9vw] font-body" style={{ color: "rgba(255,255,255,0.8)" }}>
                platform commission on each booking
              </div>
            </div>
            <div className="h-[0.2vh] w-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
            <div>
              <div className="text-[2vw] font-body font-bold" style={{ color: "#FFFFFF" }}>Workers keep 80%</div>
              <div className="mt-[0.8vh] text-[1.7vw] font-body" style={{ color: "rgba(255,255,255,0.65)" }}>
                Above market rate vs. informal sector — built-in worker retention
              </div>
            </div>
          </div>

          <div className="mt-[2.5vh] text-[1.7vw] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
            Scales directly with booking volume
          </div>
        </div>

        {/* Unit economics */}
        <div className="w-[22%] flex flex-col pt-[3.5vh] pb-[3vh] px-[2vw] justify-center gap-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
          <div className="text-[1.4vw] font-body tracking-[0.15em] uppercase mb-[1vh]" style={{ color: "#C1622F" }}>
            Unit Economics
          </div>
          <div>
            <div className="text-[3vw] font-display font-black" style={{ color: "#2D2926" }}>240 ETB</div>
            <div className="text-[1.6vw] font-body mt-[0.5vh]" style={{ color: "#8B7567" }}>avg. revenue per booking</div>
          </div>
          <div className="h-[0.15vh]" style={{ backgroundColor: "#D4C4B4" }} />
          <div>
            <div className="text-[3vw] font-display font-black" style={{ color: "#2D2926" }}>6.2x</div>
            <div className="text-[1.6vw] font-body mt-[0.5vh]" style={{ color: "#8B7567" }}>LTV to CAC target (yr 2)</div>
          </div>
          <div className="h-[0.15vh]" style={{ backgroundColor: "#D4C4B4" }} />
          <div>
            <div className="text-[3vw] font-display font-black" style={{ color: "#2D2926" }}>14mo</div>
            <div className="text-[1.6vw] font-body mt-[0.5vh]" style={{ color: "#8B7567" }}>avg. subscriber lifetime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
