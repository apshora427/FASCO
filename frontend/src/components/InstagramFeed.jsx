import follow1 from "../assets/figma/follow-1.jpg"
import follow2 from "../assets/figma/follow-2.jpg"
import follow3 from "../assets/figma/follow-3.jpg"
import follow4 from "../assets/figma/follow-4.jpg"
import follow5 from "../assets/figma/follow-5.jpg"
import follow6 from "../assets/figma/follow-6.jpg"
import follow7 from "../assets/figma/follow-7.jpg"

const posts = [
  { src: follow1, width: 320, height: 308 },
  { src: follow2, width: 256, height: 380 },
  { src: follow3, width: 256, height: 308 },
  { src: follow4, width: 256, height: 380 },
  { src: follow5, width: 256, height: 308 },
  { src: follow6, width: 256, height: 380 },
  { src: follow7, width: 320, height: 308 },
]

const InstagramFeed = () => (
  <section className="overflow-hidden bg-white py-[clamp(50px,10.4vw,150px)]">
    <div className="container mb-[clamp(40px,6.95vw,100px)] text-center">
      <h2 className="section-title">Follow Us On Instagram</h2>
      <p className="section-copy mx-auto mt-5 max-w-[614px]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
        duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices
        sollicitudin.
      </p>
    </div>

    <div className="mx-auto hidden max-w-[1950px] items-center justify-center lg:flex">
      {posts.map((post, i) => (
        <a
          key={i}
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
          aria-label={`FASCO on Instagram ${i + 1}`}
          className="group block shrink-0"
          style={{ height: post.height === 380 ? "min(380px, 19.79vw)" : "min(308px, 16.04vw)" }}>
          <img
            src={post.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-auto object-cover transition-opacity duration-300 group-hover:opacity-90"
          />
        </a>
      ))}
    </div>

    <div className="container grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
      {posts.map((post, i) => (
        <a
          key={i}
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
          aria-label={`FASCO on Instagram ${i + 1}`}
          className="group block overflow-hidden">
          <img
            src={post.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </a>
      ))}
    </div>
  </section>
)

export default InstagramFeed
