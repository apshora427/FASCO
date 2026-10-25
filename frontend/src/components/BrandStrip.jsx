// Brand wordmarks measured off the Figma frame (widths/heights per brand):
// CHANEL 103px wide cap 14.5, LOUIS VUITTON 102 cap 9, PRADA 104 cap 16,
// Calvin Klein 101, DENIM 96 — each tuned to those ink boxes.
const brands = [
  { name: "CHANEL", className: "font-Poppins font-bold", style: { fontSize: "2.05vw", letterSpacing: "0.18em" } },
  { name: "LOUIS VUITTON", className: "font-Display font-medium", style: { fontSize: "1.3vw", letterSpacing: "0.02em" } },
  { name: "PRADA", className: "font-Display font-bold", style: { fontSize: "2.45vw", letterSpacing: "0.15em" } },
  { name: "Calvin Klein", className: "font-Poppins font-medium", style: { fontSize: "1.95vw" } },
  { name: "DENIM", className: "font-Poppins font-extrabold inline-block", style: { fontSize: "2.05vw", letterSpacing: "0.02em", transform: "scaleX(1.18)" } },
]

const BrandStrip = () => (
  <section className="bg-white" style={{ paddingInline: "16.3vw", paddingTop: "5.4vw", paddingBottom: "5.5vw" }}>
    <div className="flex items-baseline justify-between">
      {brands.map((brand) => (
        <span
          key={brand.name}
          className={`${brand.className} text-[#111111] cursor-default select-none transition-opacity hover:opacity-60`}
          style={brand.style}>
          {brand.name}
        </span>
      ))}
    </div>
  </section>
)

export default BrandStrip
