import insta1 from "../assets/shop/shop_page_12.jpg"
import insta2 from "../assets/shop/shop_page_13.jpg"
import insta3 from "../assets/shop/shop_page_14.jpg"
import insta4 from "../assets/shop/shop_page_15.jpg"
import insta5 from "../assets/shop/shop_page_16.jpg"
import insta6 from "../assets/shop/shop_page_17.jpg"
import insta7 from "../assets/shop/shop_page_18.jpg"

const posts = [
  { src: insta1, height: "h-[152px]" },
  { src: insta2, height: "h-[186px]" },
  { src: insta3, height: "h-[186px]" },
  { src: insta4, height: "h-[186px]" },
  { src: insta5, height: "h-[186px]" },
  { src: insta6, height: "h-[186px]" },
  { src: insta7, height: "h-[152px]" },
]

const InstagramFeed = () => (
  <section className="bg-white py-[70px]">
    <div className="container text-center">
      <h2 className="font-Display text-[24px] font-bold text-black">
        Follow Us On Instagram
      </h2>
      <p className="mt-[8px] mx-auto max-w-[400px] text-[8px] leading-[12px] text-subtext">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
        du du is ultrices sollicitudin aliquam sem. Scelerisque du du is
        ultrices sollicitudin.
      </p>
    </div>

    <div className="mt-[47px] flex w-full items-center justify-center gap-0">
      {posts.map((post, i) => (
        <a
          key={i}
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
            className="group min-w-0 flex-1 overflow-hidden">
          <img
            src={post.src}
            alt={`FASCO on Instagram ${i + 1}`}
            className={`w-full ${post.height} object-cover transition-transform duration-500 group-hover:scale-[1.02]`}
          />
        </a>
      ))}
    </div>
  </section>
)

export default InstagramFeed
