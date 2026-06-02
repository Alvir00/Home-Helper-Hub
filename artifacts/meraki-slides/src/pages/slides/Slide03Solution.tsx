export default function Slide03Solution() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Left: headline and description */}
      <div className="w-[44%] h-full flex flex-col justify-center px-[5vw] py-[7vh]">
        <div className="text-[1.5vw] font-body tracking-[0.2em] uppercase mb-[2vh]" style={{ color: "#8B7567" }}>
          Our Solution
        </div>
        <div className="text-[3.8vw] font-display font-bold leading-tight" style={{ color: "#2D2926", textWrap: "balance" }}>
          Book vetted home help in minutes
        </div>
        <div className="mt-[2.5vh] w-[6vw] h-[0.35vh]" style={{ backgroundColor: "#C1622F" }} />
        <div className="mt-[3vh] text-[2vw] font-body leading-relaxed" style={{ color: "#8B7567", textWrap: "pretty" }}>
          Meraki is a mobile-first platform connecting Addis Ababa households with trained, background-checked home help workers. Book, pay, and rate — all in one place.
        </div>
        <div className="mt-[4vh] flex flex-col gap-[1.8vh]">
          <div className="flex items-center gap-[1.2vw]">
            <div className="w-[0.8vw] h-[0.8vw] rounded-full" style={{ backgroundColor: "#C1622F", flexShrink: 0 }} />
            <div className="text-[1.9vw] font-body" style={{ color: "#2D2926" }}>iOS and Android apps</div>
          </div>
          <div className="flex items-center gap-[1.2vw]">
            <div className="w-[0.8vw] h-[0.8vw] rounded-full" style={{ backgroundColor: "#C1622F", flexShrink: 0 }} />
            <div className="text-[1.9vw] font-body" style={{ color: "#2D2926" }}>Real-time booking and tracking</div>
          </div>
          <div className="flex items-center gap-[1.2vw]">
            <div className="w-[0.8vw] h-[0.8vw] rounded-full" style={{ backgroundColor: "#C1622F", flexShrink: 0 }} />
            <div className="text-[1.9vw] font-body" style={{ color: "#2D2926" }}>Verified, trained workers only</div>
          </div>
        </div>
      </div>

      {/* Right: service cards */}
      <div className="flex-1 h-full flex flex-col justify-center px-[4vw] gap-[3vh]" style={{ backgroundColor: "#F0E8DF" }}>
        {/* Cleaning card */}
        <div className="px-[3vw] py-[4vh]" style={{ backgroundColor: "#FAF7F4" }}>
          <div className="text-[1.5vw] font-body tracking-[0.15em] uppercase mb-[1vh]" style={{ color: "#C1622F" }}>
            Home Cleaning
          </div>
          <div className="text-[2.4vw] font-display font-bold mb-[1.5vh]" style={{ color: "#2D2926" }}>
            Full-home, kitchen &amp; bedroom
          </div>
          <div className="text-[1.9vw] font-body" style={{ color: "#8B7567" }}>
            From 80 ETB/hr — 3-hour standard session
          </div>
        </div>

        {/* Laundry card */}
        <div className="px-[3vw] py-[4vh]" style={{ backgroundColor: "#FAF7F4" }}>
          <div className="text-[1.5vw] font-body tracking-[0.15em] uppercase mb-[1vh]" style={{ color: "#C1622F" }}>
            Laundry Service
          </div>
          <div className="text-[2.4vw] font-display font-bold mb-[1.5vh]" style={{ color: "#2D2926" }}>
            Wash, dry &amp; fold at your door
          </div>
          <div className="text-[1.9vw] font-body" style={{ color: "#8B7567" }}>
            From 100 ETB/hr — pickup and return included
          </div>
        </div>

        {/* Combined card */}
        <div className="px-[3vw] py-[4vh]" style={{ backgroundColor: "#C1622F" }}>
          <div className="text-[1.5vw] font-body tracking-[0.15em] uppercase mb-[1vh]" style={{ color: "rgba(255,255,255,0.65)" }}>
            Combined Package
          </div>
          <div className="text-[2.4vw] font-display font-bold mb-[1.5vh]" style={{ color: "#FFFFFF" }}>
            Cleaning + laundry, one booking
          </div>
          <div className="text-[1.9vw] font-body" style={{ color: "rgba(255,255,255,0.75)" }}>
            Best value — from 200 ETB flat session
          </div>
        </div>
      </div>
    </div>
  );
}
