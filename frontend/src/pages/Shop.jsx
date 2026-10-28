import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import ShopHeader from "../components/ShopHeader"
import ShopBottom from "../components/ShopBottom"

import product01 from "../assets/reference/shop/product01.jpg"
import product02 from "../assets/reference/shop/product02.jpg"
import product03 from "../assets/reference/shop/product03.jpg"
import product04 from "../assets/reference/shop/product04.jpg"
import product05 from "../assets/reference/shop/product05.jpg"
import product06 from "../assets/reference/shop/product06.jpg"
import product07 from "../assets/reference/shop/product07.jpg"
import product08 from "../assets/reference/shop/product08.jpg"
import product09 from "../assets/reference/shop/product09.jpg"

const sizes = ["s", "m", "l", "xl"]
const filterColors = [
  "lightRed", "orange", "yellow", "laim", "green", "azure", "darkBlue",
  "lightAzure", "lightBlue", "lightPurple", "purple", "violet", "pink", "red",
]
const brands = ["Minimog", "Retrolie", "Brook", "Learts", "Vagabond", "Abby"]
const collections = ["All products", "Best sellers", "New arrivals", "Accessories"]
const tags = ["Fashion", "Hats", "Sandal", "Belt", "Bags", "Snacker", "Denim", "Minimog", "Vagabond", "Sunglasses", "Beachwear"]
const priceRanges = [
  { value: "0-50", label: "$0-$50", min: 0, max: 50 },
  { value: "50-100", label: "$50-$100", min: 50, max: 100 },
  { value: "100-150", label: "$100-$150", min: 100, max: 150 },
  { value: "150-200", label: "$150-$200", min: 150, max: 200 },
  { value: "300-400", label: "$300-$400", min: 300, max: 400 },
]

const baseProducts = [
  {
    id: 1,
    title: "Rounded Red Hat",
    price: 8,
    image: product01,
    colors: ["yellow", "black"],
    filterColors: ["yellow", "lightRed"],
    sizes: ["s", "m"],
    brand: "Minimog",
    collection: "Accessories",
    tags: ["Hats", "Fashion"],
  },
  {
    id: 2,
    title: "Linen-blend Shirt",
    price: 17,
    image: product02,
    colors: ["lightBlue", "pink"],
    filterColors: ["lightBlue", "pink"],
    sizes: ["s", "m", "l"],
    brand: "Retrolie",
    collection: "New arrivals",
    tags: ["Fashion", "Denim"],
    soldOut: true,
  },
  {
    id: 3,
    title: "Long-sleeve Coat",
    price: 106,
    image: product03,
    colors: ["gray", "green"],
    filterColors: ["green", "laim"],
    sizes: ["m", "l", "xl"],
    brand: "Brook",
    collection: "Best sellers",
    tags: ["Fashion", "Belt"],
  },
  {
    id: 4,
    title: "Boxy Denim Hat",
    price: 25,
    image: product04,
    colors: ["lightBlue", "darkBlue"],
    filterColors: ["lightBlue", "darkBlue"],
    sizes: ["s", "m"],
    brand: "Learts",
    collection: "Accessories",
    tags: ["Hats", "Denim"],
  },
  {
    id: 5,
    title: "Linen Plain Top",
    price: 25,
    image: product05,
    colors: ["green", "pink"],
    filterColors: ["green", "pink"],
    sizes: ["s", "m", "l"],
    brand: "Vagabond",
    collection: "Best sellers",
    tags: ["Fashion", "Bags"],
  },
  {
    id: 6,
    title: "Oversized T-shirt",
    price: 11,
    oldPrice: 14,
    image: product06,
    colors: ["pink", "purple", "white"],
    filterColors: ["pink", "purple", "lightPurple"],
    sizes: ["s", "m", "l", "xl"],
    brand: "Abby",
    collection: "New arrivals",
    tags: ["Fashion", "Snacker"],
  },
  {
    id: 7,
    title: "Polarised Sunglasses",
    price: 18,
    oldPrice: 21,
    image: product07,
    colors: ["black", "brown"],
    filterColors: ["darkBlue", "orange"],
    sizes: ["m"],
    brand: "Minimog",
    collection: "Accessories",
    tags: ["Sunglasses", "Beachwear"],
  },
  {
    id: 8,
    title: "Rockstar Jacket",
    price: 22,
    image: product08,
    colors: ["purple", "azure"],
    filterColors: ["purple", "azure", "violet"],
    sizes: ["m", "l"],
    brand: "Retrolie",
    collection: "Best sellers",
    tags: ["Fashion", "Denim", "Vagabond"],
  },
  {
    id: 9,
    title: "Dotted Black Dress",
    price: 20,
    image: product09,
    colors: ["darkBlue", "black", "lightBlue"],
    filterColors: ["darkBlue", "lightBlue", "lightAzure"],
    sizes: ["s", "m", "l"],
    brand: "Brook",
    collection: "New arrivals",
    tags: ["Fashion", "Sandal", "Minimog"],
  },
]

const catalogue = Array.from({ length: 3 }, (_, pageIndex) =>
  baseProducts.map((product) => ({
    ...product,
    baseId: product.id,
    id: `${product.id}-${pageIndex + 1}`,
  }))
).flat()

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
  const [search, setSearch] = useState("")
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [price, setPrice] = useState("")
  const [selectedBrands, setSelectedBrands] = useState([])
  const [collection, setCollection] = useState("All products")
  const [selectedTags, setSelectedTags] = useState([])
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    size: true,
    color: true,
    price: true,
    brands: true,
    collections: true,
    tags: true,
  })

  const toggle = (value, values, setter) =>
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  const toggleSection = (section) =>
    setOpenSections((state) => ({ ...state, [section]: !state[section] }))

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const range = priceRanges.find((item) => item.value === price)

    return catalogue.filter((product) => {
      if (query && !product.title.toLowerCase().includes(query)) return false
      if (selectedSizes.length && !product.sizes.some((size) => selectedSizes.includes(size))) return false
      if (selectedColors.length && !product.filterColors.some((color) => selectedColors.includes(color))) return false
      if (range && (product.price < range.min || product.price > range.max)) return false
      if (selectedBrands.length && !selectedBrands.includes(product.brand)) return false
      if (collection !== "All products" && product.collection !== collection) return false
      if (selectedTags.length && !product.tags.some((tag) => selectedTags.includes(tag))) return false
      return true
    })
  }, [collection, price, search, selectedBrands, selectedColors, selectedSizes, selectedTags])

  const perPage = 9
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / perPage))
  const pageProducts = visibleProducts.slice((page - 1) * perPage, page * perPage)

  useEffect(() => setPage(1), [collection, price, search, selectedBrands, selectedColors, selectedSizes, selectedTags])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <main className="page _shop">
      <div className="fasco-ref _shop">
        <ShopHeader onSearch={setSearch} />
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
                      {filterColors.map((color) => (
                        <label className={`color-filter__color-option color-${color}`} key={color}>
                          <input
                            type="checkbox"
                            name="color"
                            value={color}
                            checked={selectedColors.includes(color)}
                            onChange={() => toggle(color, selectedColors, setSelectedColors)}
                          />
                          <span className="color-filter__color-circle" />
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
                  <div className="catalog__products">
                    {pageProducts.map((product) => (
                      <article className="catalog__card card-catalog _active" key={product.id}>
                        <Link to={`/product/${product.baseId}`} className="card-catalog__image">
                          <img src={product.image} alt="" />
                          {product.soldOut && <span className="sold-out">Sold Out</span>}
                        </Link>
                        <h3 className="card-catalog__title">
                          <Link to={`/product/${product.baseId}`}>{product.title}</Link>
                        </h3>
                        <div className="card-catalog__price">
                          {money(product.price)}
                          {product.oldPrice && <span className="_old-price">{money(product.oldPrice)}</span>}
                        </div>
                        <form className="card-catalog__color-picker">
                          {product.colors.map((color, index) => (
                            <label className={`card-catalog__color-option color-${color}`} key={color}>
                              <input type="radio" name={`color-${product.id}`} value={color} defaultChecked={index === 0} />
                              <span className="card-catalog__color-circle" />
                            </label>
                          ))}
                        </form>
                      </article>
                    ))}
                  </div>

                  {visibleProducts.length > 0 ? (
                    <div className="catalog__footer">
                      <div className="catalog__pagging pagging">
                        <ul className="pagging__list">
                          {Array.from({ length: pageCount }, (_, index) => (
                            <li className="pagging__item" key={index + 1}>
                              <a
                                href={`#page-${index + 1}`}
                                className={`pagging__link ${page === index + 1 ? "_active" : ""}`}
                                onClick={(event) => {
                                  event.preventDefault()
                                  setPage(index + 1)
                                }}>
                                {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="pagging__arrow"
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
