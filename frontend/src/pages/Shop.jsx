import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { LuRefreshCw } from "react-icons/lu"
import ShopHeader from "../components/ShopHeader"
import ShopBottom from "../components/ShopBottom"
import { getProducts } from "../api/backend"
import { resolveImage } from "../data/products"
const money = (value) => `$${Number(value).toFixed(2)}`

const FilterGroup = ({ name, title, open, onToggle, children }) => (
  <div className={`spoiler-block__item filter-catalog__${name} ${name}-filter`}>
    <button
      type="button"
      className={`spoiler-block__title ${name}-filter__title _icon-arrow ${open ? "_active" : ""}`}
      onClick={onToggle}>
      {title}
    </button>
    <div className={`${name}-filter__body`} hidden={!open}>
      {children}
    </div>
  </div>
)

const Shop = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState(() => new URLSearchParams(location.search).get("q") || "")
  const [catalogue, setCatalogue] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [price, setPrice] = useState("")
  const [availability, setAvailability] = useState("all")
  const [sort, setSort] = useState("newest")
  const [perPage, setPerPage] = useState(9)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [collection, setCollection] = useState(() => new URLSearchParams(location.search).get("collection") || "All products")
  const [selectedTags, setSelectedTags] = useState([])
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    size: true,
    color: true,
    price: true,
    availability: true,
    brands: true,
    collections: true,
    tags: true,
  })

  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get("q") || "")
    setCollection(new URLSearchParams(location.search).get("collection") || "All products")
  }, [location.search])

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError("")
    getProducts()
      .then((result) => {
        if (!active) return
        if (!Array.isArray(result)) {
          setLoadError("The product catalogue is unavailable. Check your connection and try again.")
          return
        }
        setCatalogue(result.map((product) => ({
          ...product,
          image: resolveImage(product.image),
          colors: Array.isArray(product.colors) ? product.colors : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
        })))
      })
      .catch(() => {
        if (active) setLoadError("The product catalogue is unavailable. Check your connection and try again.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reloadKey])

  const brands = useMemo(
    () => [...new Set(catalogue.map((product) => product.brand).filter(Boolean))].sort(),
    [catalogue]
  )
  const categories = useMemo(
    () => [...new Set(catalogue.map((product) => product.category).filter(Boolean))].sort(),
    [catalogue]
  )
  const sizes = useMemo(
    () => [...new Set(catalogue.flatMap((product) => product.sizes))].sort(),
    [catalogue]
  )
  const colors = useMemo(
    () => [...new Set(catalogue.flatMap((product) => product.colors))].sort(),
    [catalogue]
  )
  const tags = useMemo(
    () => [...new Set(catalogue.map((product) => product.tag).filter(Boolean))].sort(),
    [catalogue]
  )
  const priceRanges = useMemo(() => {
    const maxPrice = Math.max(...catalogue.map((product) => product.price), 0)
    const upperBound = Math.max(50, (Math.floor(maxPrice / 50) + 1) * 50)
    return Array.from({ length: upperBound / 50 }, (_, index) => {
      const min = index * 50
      const max = min + 50
      return { value: `${min}-${max}`, label: `$${min}–$${max}`, min, max }
    })
  }, [catalogue])
  const collections = [
    "All products",
    ...(catalogue.some((product) => product.arrival) ? ["New arrivals"] : []),
    ...(catalogue.some((product) => product.originalPrice > product.price) ? ["On sale"] : []),
    ...categories.filter((category) => !["All products", "New arrivals", "On sale"].includes(category)),
  ]

  const toggle = (value, values, setter) =>
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  const toggleSection = (section) =>
    setOpenSections((state) => ({ ...state, [section]: !state[section] }))

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const range = priceRanges.find((item) => item.value === price)

    const filtered = catalogue.filter((product) => {
      if (query && !product.title.toLowerCase().includes(query)) return false
      if (selectedSizes.length && !product.sizes.some((size) => selectedSizes.includes(size))) return false
      if (selectedColors.length && !product.colors.some((color) => selectedColors.includes(color))) return false
      if (range && (product.price < range.min || product.price >= range.max)) return false
      if (availability === "in-stock" && product.stock <= 0) return false
      if (availability === "out-of-stock" && product.stock > 0) return false
      if (selectedBrands.length && !selectedBrands.includes(product.brand)) return false
      if (collection === "New arrivals" && !product.arrival) return false
      else if (collection === "On sale" && !(product.originalPrice > product.price)) return false
      else if (!["All products", "New arrivals", "On sale"].includes(collection) && product.category !== collection) return false
      if (selectedTags.length && !selectedTags.includes(product.tag)) return false
      return true
    })
    return filtered.sort((left, right) => {
      if (sort === "price-asc") return left.price - right.price
      if (sort === "price-desc") return right.price - left.price
      const byDate = new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
      return byDate || Number(right.id) - Number(left.id)
    })
  }, [availability, catalogue, collection, price, priceRanges, search, selectedBrands, selectedColors, selectedSizes, selectedTags, sort])

  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / perPage))
  const pageProducts = visibleProducts.slice((page - 1) * perPage, page * perPage)

  useEffect(() => setPage(1), [availability, collection, perPage, price, search, selectedBrands, selectedColors, selectedSizes, selectedTags, sort])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <main className="page _shop">
      <div className="fasco-ref _shop">
        <ShopHeader onSearch={(query) => {
          setSearch(query)
          navigate({ pathname: "/shop", search: query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "" }, { replace: true })
        }} />
        <div className="page__fashion fashion">
          <div className="fashion__container">
            <div className="fashion__header-content">
              <h1 className="fashion__title _active">Fashion</h1>
              <nav className="breadcrumbs">
                <ul className="breadcrumbs__list">
                  <li className="breadcrumbs__item"><Link to="/" className="breadcrumbs__link">Home</Link></li>
                  <li className="breadcrumbs__item"><span className="breadcrumbs__current">Fashion</span></li>
                </ul>
              </nav>
            </div>

            <div className="fashion__catalog catalog">
              <div className="catalog__body">
                <div className="catalog__filter filter-catalog">
                  <button
                    type="button"
                    className={`filter-catalog__title _icon-arrow ${filtersOpen ? "_active" : ""}`}
                    onClick={() => setFiltersOpen((open) => !open)}>
                    Filters
                  </button>
                  <form
                    id="shopFilterForm"
                    action="#"
                    className={`spoiler-block filter-catalog__items ${filtersOpen ? "_open" : ""}`}
                    onSubmit={(event) => event.preventDefault()}>
                    <FilterGroup name="size" title="Size" open={openSections.size} onToggle={() => toggleSection("size")}>
                      {sizes.map((size) => (
                        <label className="size-filter__option" key={size}>
                          <input
                            type="checkbox"
                            name="size"
                            value={size}
                            checked={selectedSizes.includes(size)}
                            onChange={() => toggle(size, selectedSizes, setSelectedSizes)}
                          />
                          <span className="size-filter__custom-checkbox">{size.toUpperCase()}</span>
                        </label>
                      ))}
                    </FilterGroup>

                    <FilterGroup name="color" title="Colors" open={openSections.color} onToggle={() => toggleSection("color")}>
                      {colors.map((color) => (
                        <label className={`color-filter__color-option color-${color}`} key={color}>
                          <input
                            type="checkbox"
                            name="color"
                            value={color}
                            checked={selectedColors.includes(color)}
                            onChange={() => toggle(color, selectedColors, setSelectedColors)}
                          />
                          <span className="color-filter__color-circle" style={{ backgroundColor: color }} />
                        </label>
                      ))}
                    </FilterGroup>

                    <FilterGroup name="price" title="Prices" open={openSections.price} onToggle={() => toggleSection("price")}>
                      {priceRanges.map((range) => (
                        <label className="price-filter__option" key={range.value}>
                          <input
                            type="radio"
                            name="price"
                            value={range.value}
                            checked={price === range.value}
                            onChange={() => setPrice(range.value)}
                          />
                          <span className="price-filter__custom-price">{range.label}</span>
                        </label>
                      ))}
                    </FilterGroup>

                    <FilterGroup name="availability" title="Availability" open={openSections.availability} onToggle={() => toggleSection("availability")}>
                      {[
                        ["all", "All products"],
                        ["in-stock", "In stock"],
                        ["out-of-stock", "Out of stock"],
                      ].map(([value, label]) => (
                        <label className="price-filter__option" key={value}>
                          <input
                            type="radio"
                            name="availability"
                            value={value}
                            checked={availability === value}
                            onChange={() => setAvailability(value)}
                          />
                          <span className="price-filter__custom-price">{label}</span>
                        </label>
                      ))}
                    </FilterGroup>

                    <FilterGroup name="brands" title="Brands" open={openSections.brands} onToggle={() => toggleSection("brands")}>
                      {brands.map((brand) => (
                        <label className="brands-filter__option" key={brand}>
                          <input
                            type="checkbox"
                            name="brand"
                            value={brand}
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggle(brand, selectedBrands, setSelectedBrands)}
                          />
                          <span className="brands-filter__custom-brand">{brand}</span>
                        </label>
                      ))}
                    </FilterGroup>

                    <FilterGroup name="collections" title="Collections" open={openSections.collections} onToggle={() => toggleSection("collections")}>
                      {collections.map((item) => (
                        <label className="collections-filter__option" key={item}>
                          <input
                            type="radio"
                            name="collection"
                            value={item}
                            checked={collection === item}
                            onChange={() => setCollection(item)}
                          />
                          <span className="collections-filter__custom-collection">{item}</span>
                        </label>
                      ))}
                    </FilterGroup>

                    <FilterGroup name="tags" title="Tags" open={openSections.tags} onToggle={() => toggleSection("tags")}>
                      {tags.map((tag) => (
                        <label className="tags-filter__option" key={tag}>
                          <input
                            type="checkbox"
                            name="tag"
                            value={tag}
                            checked={selectedTags.includes(tag)}
                            onChange={() => toggle(tag, selectedTags, setSelectedTags)}
                          />
                          <span className="tags-filter__custom-tag">{tag}</span>
                        </label>
                      ))}
                    </FilterGroup>
                  </form>
                </div>

                <div className="catalog__content">
                  {loading && <p className="catalog__footer" role="status">Loading products…</p>}
                  {!loading && loadError && (
                    <div className="catalog__footer" role="alert">
                      <p>{loadError}</p>
                      <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                        <LuRefreshCw size={15} /> Try again
                      </button>
                    </div>
                  )}
                  {!loading && !loadError && (
                  <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#6a6a6a] dark:text-[#aaa]" role="status">
                      {visibleProducts.length} product{visibleProducts.length === 1 ? "" : "s"}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 text-sm text-[#6a6a6a] dark:text-[#aaa]">
                        Sort
                        <select
                          className="rounded border border-[#ddd] bg-white px-2 py-2 text-sm text-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
                          value={sort}
                          onChange={(event) => setSort(event.target.value)}
                        >
                          <option value="newest">Newest</option>
                          <option value="price-asc">Price: low to high</option>
                          <option value="price-desc">Price: high to low</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#6a6a6a] dark:text-[#aaa]">
                        Per page
                        <select
                          className="rounded border border-[#ddd] bg-white px-2 py-2 text-sm text-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
                          value={perPage}
                          onChange={(event) => setPerPage(Number(event.target.value))}
                        >
                          {[9, 18, 36].map((count) => <option key={count} value={count}>{count}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="catalog__products">
                    {pageProducts.map((product) => (
                      <article className="catalog__card card-catalog _active" key={product.id}>
                        <Link to={`/product/${product.id}`} className="card-catalog__image">
                          <img src={product.image} alt="" />
                          {product.stock <= 0 && <span className="sold-out">Sold Out</span>}
                        </Link>
                        <h3 className="card-catalog__title">
                          <Link to={`/product/${product.id}`}>{product.title}</Link>
                        </h3>
                        <div className="card-catalog__price">
                          {money(product.price)}
                          {product.originalPrice > product.price && <span className="_old-price">{money(product.originalPrice)}</span>}
                        </div>
                        <form className="card-catalog__color-picker">
                          {product.colors.map((color, index) => (
                            <label className={`card-catalog__color-option color-${color}`} key={color}>
                              <input type="radio" name={`color-${product.id}`} value={color} defaultChecked={index === 0} aria-label={`${product.title} color ${color}`} />
                              <span className="card-catalog__color-circle" style={{ backgroundColor: color }} />
                            </label>
                          ))}
                        </form>
                      </article>
                    ))}
                  </div>

                  {visibleProducts.length > 0 ? (
                    <div className="catalog__footer">
                      <div className="catalog__pagging pagging">
                        <button
                          type="button"
                          className="pagging__arrow"
                          disabled={page === 1}
                          aria-label="Previous page"
                          onClick={() => setPage((current) => Math.max(1, current - 1))}>
                          «
                        </button>
                        <ul className="pagging__list">
                          {Array.from({ length: pageCount }, (_, index) => (
                            <li className="pagging__item" key={index + 1}>
                              <button
                                type="button"
                                className={`pagging__link ${page === index + 1 ? "_active" : ""}`}
                                aria-current={page === index + 1 ? "page" : undefined}
                                onClick={() => setPage(index + 1)}>
                                {index + 1}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="pagging__arrow"
                          disabled={page === pageCount}
                          aria-label="Next page"
                          onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
                          »
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="catalog__footer">
                      <p>No products match these filters.</p>
                    </div>
                  )}
                  </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ShopBottom />
    </main>
  )
}

export default Shop
