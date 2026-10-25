import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { FiChevronDown, FiGrid, FiHeart, FiList, FiSliders } from "react-icons/fi"
import Navbar from "../components/Navbar"
import PromoBanner from "../components/PromoBanner"
import Features from "../components/Features"
import InstagramFeed from "../components/InstagramFeed"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import { products as catalogue, formatPrice } from "../data/products"
import shopImage1 from "../assets/shop/shop_page_1.png"
import shopImage2 from "../assets/shop/shop_page_2.png"
import shopImage3 from "../assets/shop/shop_page_3.png"
import shopImage4 from "../assets/shop/shop_page_4.png"
import shopImage5 from "../assets/shop/shop_page_5.png"
import shopImage7 from "../assets/shop/shop_page_7.png"
import shopImage8 from "../assets/shop/shop_page_8.png"
import shopImage9 from "../assets/shop/shop_page_9.png"
import shopImage10 from "../assets/shop/shop_page_10.png"

const sizes = ["S", "M", "L", "XL"]
const palette = ["#f26656", "#ffa84d", "#f4dc50", "#92dc57", "#5cd49b", "#5ec2df", "#dc82d9", "#fd8097", "#54d6f2", "#728ef4", "#8078ee", "#8fbeed", "#f292c4", "#ea5d79"]
const brands = ["Minimog", "Retrolie Brook", "Vortak", "Vegan", "Abby"]
const collections = ["All products", "Best sellers", "New arrivals", "Accessories"]
const tags = ["Fashion", "Hats", "Sandal", "Bags", "Sneaker", "Denim", "Shirts", "Negligé", "Sunglasses", "Beachwear"]
const prices = [8, 16, 16, 25, 25, 11, 20, 22, 12, 34, 36, 42, 48, 54, 65, 72, 89, 95]
const shopImages = [shopImage1, shopImage2, shopImage3, shopImage4, shopImage5, shopImage7, shopImage8, shopImage9, shopImage10]
const shopPositions = ["70% center", "center", "43% center", "center", "center", "center", "center", "center", "center"]
const products = catalogue.map((product, index) => ({ ...product, image: shopImages[index % shopImages.length], imagePosition: shopPositions[index % shopPositions.length], price: prices[index] ?? product.price, sizes: sizes.slice(index % 3, (index % 3) + 2), colors: [palette[index % palette.length], palette[(index + 6) % palette.length]] }))

const FilterHeading = ({ children, open, onClick }) => <button type="button" onClick={onClick} className="flex w-full items-center justify-between text-left text-[11px] font-medium text-[#292929]">{children}<FiChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} /></button>

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [activeCollection, setActiveCollection] = useState("All products")
  const [maxPrice, setMaxPrice] = useState(400)
  const [sort, setSort] = useState("Featured")
  const [grid, setGrid] = useState(3)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [openSections, setOpenSections] = useState({ brands: true, collections: true })
  const toggle = (value, values, setter) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  const visibleProducts = useMemo(() => [...products.filter((product) => {
    const collectionMatch = activeCollection === "All products" || (activeCollection === "New arrivals" ? product.arrival : product.category === activeCollection)
    const sizeMatch = !selectedSizes.length || product.sizes.some((size) => selectedSizes.includes(size))
    return product.price <= maxPrice && sizeMatch && collectionMatch && (!selectedColors.length || product.colors.some((color) => selectedColors.includes(color)))
  })].sort((a, b) => sort === "Price: low to high" ? a.price - b.price : sort === "Price: high to low" ? b.price - a.price : sort === "Newest" ? Number(Boolean(b.arrival)) - Number(Boolean(a.arrival)) : a.id - b.id), [activeCollection, maxPrice, selectedColors, selectedSizes, sort])
  const perPage = 9
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / perPage))
  const pageProducts = visibleProducts.slice((page - 1) * perPage, page * perPage)
  useEffect(() => setPage(1), [activeCollection, maxPrice, selectedColors, selectedSizes, sort])

  return <main className="min-h-screen bg-white text-[#111]"><Navbar />
    <section className="container pb-20 pt-8 lg:pt-11">
      <div className="text-center"><h1 className="font-Display text-[31px] font-medium leading-none">Fashion</h1><p className="mt-3 text-[8px] text-[#6c6c6c]">Home <span className="mx-1">›</span> Fashion</p></div>
      <div className="mt-12 flex items-center justify-between lg:hidden"><button type="button" onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 text-sm font-medium"><FiSliders /> Filters</button><span className="text-xs text-[#777]">{visibleProducts.length} products</span></div>
      <div className="mt-9 grid gap-8 lg:grid-cols-[182px_minmax(0,1fr)] lg:gap-[65px]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}><h2 className="mb-6 font-Display text-[18px] font-semibold">Filters</h2>
          <div className="border-b border-[#eeeeee] pb-5"><p className="mb-3 text-[11px] font-medium">Size</p><div className="flex gap-2">{sizes.map((size) => <button key={size} type="button" onClick={() => toggle(size, selectedSizes, setSelectedSizes)} className={`h-7 min-w-7 rounded border text-[9px] ${selectedSizes.includes(size) ? "border-black bg-black text-white" : "border-[#dcdcdc] text-[#888]"}`}>{size}</button>)}</div></div>
          <div className="border-b border-[#eeeeee] py-5"><p className="mb-3 text-[11px] font-medium">Colors</p><div className="flex max-w-[148px] flex-wrap gap-1.5">{palette.map((color) => <button key={color} type="button" aria-label={`Filter ${color}`} onClick={() => toggle(color, selectedColors, setSelectedColors)} className={`h-4 w-4 rounded-full ${selectedColors.includes(color) ? "scale-125 ring-1 ring-offset-2 ring-[#888]" : ""}`} style={{ backgroundColor: color }} />)}</div></div>
          <div className="border-b border-[#eeeeee] py-5"><p className="mb-4 text-[11px] font-medium">Prices</p><input aria-label="Maximum price" className="shop-range" type="range" min="10" max="400" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} style={{ "--range-progress": `${(maxPrice / 400) * 100}%` }} /><div className="mt-3 flex justify-between text-[8px] text-[#898989]"><span>$10</span><span>${maxPrice}</span></div><div className="mt-3 space-y-1.5 text-[9px] text-[#777]">{["$10–$100", "$100–$150", "$150–$200", "$200–$300", "$300–$400"].map((price) => <button className="block hover:text-black" key={price} onClick={() => setMaxPrice(Number(price.match(/\d+$/)[0]))}>{price}</button>)}</div></div>
          <div className="border-b border-[#eeeeee] py-5"><FilterHeading open={openSections.brands} onClick={() => setOpenSections((state) => ({ ...state, brands: !state.brands }))}>Brands</FilterHeading>{openSections.brands && <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] text-[#777]">{brands.map((brand) => <button key={brand} className="hover:text-black">{brand}</button>)}</div>}</div>
          <div className="border-b border-[#eeeeee] py-5"><FilterHeading open={openSections.collections} onClick={() => setOpenSections((state) => ({ ...state, collections: !state.collections }))}>Collections</FilterHeading>{openSections.collections && <div className="mt-3 space-y-1.5 text-[9px] text-[#777]">{collections.map((collection) => <button type="button" key={collection} onClick={() => setActiveCollection(collection)} className={`block hover:text-black ${activeCollection === collection ? "font-medium text-black" : ""}`}>{collection}</button>)}</div>}</div>
          <div className="pt-5"><p className="mb-3 text-[11px] font-medium">Tags</p><div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] text-[#777]">{tags.map((tag) => <button key={tag} className="hover:text-black">{tag}</button>)}</div></div>
        </aside>
        <div><div className="mb-5 flex items-center justify-between"><label className="flex items-center gap-2 text-[10px] font-medium">Sort selling -<select value={sort} onChange={(event) => setSort(event.target.value)} className="cursor-pointer appearance-none bg-transparent pr-3 text-[#777] outline-none"><option>Featured</option><option>Newest</option><option>Price: low to high</option><option>Price: high to low</option></select></label><div className="hidden items-center gap-2 text-[#9b9b9b] lg:flex"><button aria-label="List view" onClick={() => setGrid(2)} className={grid === 2 ? "text-black" : ""}><FiList size={13} /></button><button aria-label="Three-column view" onClick={() => setGrid(3)} className={grid === 3 ? "text-black" : ""}><FiGrid size={13} /></button><button aria-label="Four-column view" onClick={() => setGrid(4)} className={grid === 4 ? "text-black" : ""}><FiGrid size={13} /></button></div></div>
          {visibleProducts.length ? <div className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-5 ${grid === 2 ? "lg:grid-cols-2" : grid === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>{pageProducts.map((product) => <Link to={`/product/${product.id}`} key={product.id} className="group block"><div className="relative aspect-[.82] overflow-hidden bg-[#ededed]"><img src={product.image} alt={product.title} loading="lazy" decoding="async" style={{ objectPosition: product.imagePosition }} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /><button type="button" aria-label={`Add ${product.title} to wishlist`} onClick={(event) => event.preventDefault()} className="absolute right-2 top-2 rounded-full bg-white/85 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"><FiHeart size={13} /></button></div><h3 className="mt-3 text-[10px] font-medium leading-none">{product.title}</h3><p className="mt-1 text-[9px] text-[#202020]">{formatPrice(product.price)}</p><div className="mt-2 flex gap-1.5">{product.colors.map((color) => <span key={color} className="h-3.5 w-3.5 rounded-full border border-[#aaa] p-[2px]" style={{ borderColor: color }}><span className="block h-full w-full rounded-full" style={{ backgroundColor: color }} /></span>)}</div></Link>)}</div> : <div className="py-24 text-center text-sm text-[#777]">No products match these filters. <button onClick={() => { setSelectedColors([]); setSelectedSizes([]); setActiveCollection("All products"); setMaxPrice(400) }} className="underline text-black">Reset filters</button></div>}
          <nav aria-label="Pagination" className="mt-14 flex justify-center gap-5 text-[10px] text-[#777]">{Array.from({ length: pageCount }, (_, index) => <button key={index + 1} onClick={() => setPage(index + 1)} className={page === index + 1 ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f3f3] text-black" : ""}>{index + 1}</button>)}{page < pageCount && <button onClick={() => setPage((current) => current + 1)}>›</button>}</nav>
        </div>
      </div>
    </section>
    <PromoBanner />
    <Features />
    <InstagramFeed />
    <Newsletter />
    <Footer />
  </main>
}
export default Shop
