import { useEffect, useState } from "react"
import { Link } from "react-router"
import { toast } from "react-toastify"
import { LuPlus } from "react-icons/lu"
import {
  createProduct,
  getProducts,
  getCategories,
  updateProduct,
  deleteProduct,
} from "../../api/backend"
import { Badge, EmptyState, SectionTitle, Spinner, card, btnDark, Drawer, inputCls } from "./adminUi"

// The product form feeds from the same fields the catalog screen renders — the
// backend stores them by id so the DB is the single source of truth.
const EMPTY_FORM = {
  title: "",
  brand: "Al Karam",
  category: "",
  price: "",
  originalPrice: "",
  discount: "",
  tag: "",
  rating: "5",
  reviews: "(0)",
  image: "arrival-1",
  images: "",
  sizes: "",
  colors: "",
  stock: "",
  arrival: false,
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState("")
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([getCategories(), getProducts()])
      .then(([cats, prods]) => {
        if (!alive) return
        setCategories(cats?.success ? cats.category.map((c) => c.categoryName) : [])
        setProducts(prods?.success ? prods.products : [])
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
    return () => { alive = false }
  }, [])

  const refresh = () => {
    getProducts()
      .then((res) => setProducts(res?.success ? res.products : []))
      .catch(() => setProducts([]))
  }

  const filtered = products.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (cat && p.category !== cat) return false
    return true
  })

  const startEdit = (prod) => {
    setEditing(prod)
    setForm({
      title: prod.title,
      brand: prod.brand,
      category: prod.category,
      price: String(prod.price),
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : "",
      discount: prod.discount || "",
      tag: prod.tag || "",
      rating: String(prod.rating),
      reviews: prod.reviews || "(0)",
      image: prod.image,
      images: prod.images ? prod.images.join(", ") : "",
      sizes: prod.sizes ? prod.sizes.join(", ") : "",
      colors: prod.colors ? prod.colors.join(", ") : "",
      stock: prod.stock ? String(prod.stock) : "",
      arrival: !!prod.arrival,
    })
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.category || !form.price) {
      toast.error("Title, category and price are required")
      return
    }
    if (form.price < 0 || Number.isNaN(form.price)) {
      toast.error("Price must be a number ≥ 0")
      return
    }
    setBusy(true)
    const payload = {
      title: form.title.trim(),
      brand: form.brand.trim() || undefined,
      category: form.category,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      discount: form.discount.trim() || undefined,
      tag: form.tag.trim() || undefined,
      rating: Number(form.rating) || undefined,
      reviews: form.reviews.trim() || undefined,
      image: form.image,
      images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      stock: form.stock ? Number(form.stock) : undefined,
      arrival: form.arrival,
    }
    const res = editing
      ? await updateProduct(editing.id, payload)
      : await createProduct({ ...payload })
    setBusy(false)
    if (res?.success) {
      toast.success(editing ? "Product updated" : "Product created")
      setEditing(null)
      setForm({ ...EMPTY_FORM })
      refresh()
    } else {
      toast.error(res?.message || "Could not save the product")
    }
  }

  const remove = async (id) => {
    const res = await deleteProduct(id)
    if (res?.success) {
      toast.success("Product deleted")
      refresh()
    } else {
      toast.error(res?.message || "Could not delete")
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Products"
        subtitle="The catalogue lives in MongoDB — add, edit or remove anything from here and the storefront changes instantly."
        action={
          <button type="button" className={btnDark} onClick={() => { setEditing(null); setForm({ ...EMPTY_FORM }) }}>
            <LuPlus size={16} /> New Product
          </button>
        }
      >
        <LuPackage size={16} />
      </SectionTitle>

      <div className="flex flex-wrap gap-3">
        <input
          className={inputCls}
          placeholder="Search product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No products found" hint="Try a different search or add a new product." />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((p) => (
            <article key={p.id} className={card}>
              <div className="flex items-start gap-4">
                <img src={p.image} alt={p.title} className="h-28 w-24 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-[#1a1a1a] dark:text-white">{p.title}</h3>
                  <p className="text-[12px] text-[#8a8a8a] dark:text-[#aaa]">{p.brand} · {p.category}</p>
                  <p className="mt-1 text-[14px] font-bold text-black dark:text-white">
                    ${p.price.toFixed(2)}
                    {p.originalPrice && p.price < p.originalPrice && (
                      <span className="ml-2 text-[12px] font-normal text-[#8a8a8a] line-through dark:text-[#aaa]">${p.originalPrice.toFixed(2)}</span>
                    )}
                    {p.discount && <Badge kind="sale">{p.discount}</Badge>}
                  </p>
                  <p className="mt-1 text-[12px] text-[#9a9a9a] dark:text-[#aaa]">{p.rating} ★ · {p.reviews}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.sizes?.map((s) => <Badge key={s} kind="user">{s}</Badge>)}
                    {p.colors?.map((c) => <Badge key={c} kind="user">{c}</Badge>)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#e2e2e2] px-3 py-1.5 text-[12px] font-medium text-[#5a5a5a] hover:border-black hover:text-black dark:border-[#333] dark:text-[#aaa] dark:hover:border-[#fca120] dark:hover:text-[#fca120]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id, p.title)}
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#f3c6c6] px-3 py-1.5 text-[12px] font-medium text-[#b91c1c] hover:bg-[#f87171]/10 dark:border-[#4a1212] dark:text-[#f87171] dark:hover:bg-[#4a1212]/15"
                  >
                    Delete
                  </button>
                </div>
                <span className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">stock {p.stock ?? "—"}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing ? "Edit product" : "New product"}>
        <form className="grid grid-cols-1 gap-x-6 gap-y-4" onSubmit={save}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Product name *</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Shiny Dress" required />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Category *</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Price (USD) *</label>
            <input className={inputCls} type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="95.50" required />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Original price (sale)</label>
            <input className={inputCls} type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="190" />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Discount badge (e.g. 50% OFF)</label>
            <input className={inputCls} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="50% OFF" />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Brand</label>
            <input className={inputCls} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Al Karam" />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Tag badge (e.g. Almost Sold Out)</label>
            <input className={inputCls} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="New Arrival" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Main image key</label>
            <select className={inputCls} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}>
              {Object.keys(IMAGE_KEYS).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Extra gallery images (comma separated keys or URLs)</label>
            <input className={inputCls} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="deal-1, follow-3" />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Available sizes (comma separated)</label>
            <input className={inputCls} value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Available colours (comma separated)</label>
            <input className={inputCls} value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, Blue" />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Stock quantity</label>
            <input className={inputCls} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="12" />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc] flex items-center gap-2">
              <input type="checkbox" checked={form.arrival} onChange={(e) => setForm({ ...form, arrival: e.target.checked })} />
              Is new arrival?
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className={btnDark} onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" disabled={busy} className="inline-flex items-center rounded-[8px] bg-black px-5 py-2.5 text-[13px] font-medium text-white dark:bg-[#fca120] dark:text-black">
              {busy ? "Saving…" : editing ? "Update product" : "Create product"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}

// The same keys the storefront asset registry resolves from.
const IMAGE_KEYS = {
  "arrival-1": "arrival-1",
  "arrival-2": "arrival-2",
  "arrival-3": "arrival-3",
  "arrival-4": "arrival-4",
  "arrival-5": "arrival-5",
  "arrival-6": "arrival-6",
  "deal-1": "deal-1",
  "deal-2": "deal-2",
  "deal-3": "deal-3",
  "deal-4": "deal-4",
  "follow-2": "follow-2",
  "follow-3": "follow-3",
  "follow-4": "follow-4",
  "follow-5": "follow-5",
  "follow-6": "follow-6",
}
