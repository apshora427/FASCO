import { useEffect, useState } from "react"
import { LuRefreshCw, LuSearch } from "react-icons/lu"
import { toast } from "react-toastify"
import { getOrders, updateOrderStatus } from "../../api/backend"
import { Badge, EmptyState, SectionTitle, Spinner, Drawer } from "./adminUi"
import { inputCls, btnDark } from "./adminUi"

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"]

export default function Orders() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [detail, setDetail] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setRefreshing(true)
      setLoadError("")
      try {
        const res = await getOrders({ status, search })
        if (!active) return
        if (res?.success && Array.isArray(res.orders)) setList(res.orders)
        else setLoadError(res?.message || "Could not load orders. Check the backend connection.")
      } catch {
        if (active) setLoadError("Could not load orders. Check the backend connection.")
      } finally {
        if (active) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }, search ? 250 : 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [status, search, reloadKey])

  const changeStatus = async (order, next) => {
    if (updating || next === order.status) return
    setUpdating(order._id)
    try {
      const res = await updateOrderStatus(order._id, next)
      if (res?.success) {
        toast.success(`Order marked ${next}`)
        setList((current) =>
          current.map((item) => item._id === order._id ? res.order : item)
        )
        if (detail?._id === order._id) setDetail(res.order)
      } else {
        toast.error(res?.message || "Could not update order")
      }
    } catch {
      toast.error("Could not connect to the server")
    } finally {
      setUpdating(null)
    }
  }

  const refresh = () => setReloadKey((current) => current + 1)
  const openDetail = (order) => setDetail(order)
  const closeDetail = () => setDetail(null)

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Orders"
        subtitle="Every sale, from the cart checkout → the MongoDB orders collection. Move them through the pipeline here."
        action={
          <div className="flex flex-wrap gap-3">
          <button type="button" className={btnDark} onClick={refresh} disabled={refreshing} aria-label="Refresh orders">
            <LuRefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <select className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="relative">
              <LuSearch
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]"
              />
              <input
                className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
                placeholder="Search order # or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        }>
        <LuSearch size={16} />
      </SectionTitle>

      {loading ? (
        <Spinner />
      ) : loadError ? (
        <div className="rounded-[14px] border border-rose-200 bg-white p-6 text-center dark:border-rose-900 dark:bg-[#161616]">
          <p className="text-sm text-[#b91c1c]">{loadError}</p>
        </div>
      ) : list.length === 0 ? (
        <EmptyState title={search || status ? "No matching orders" : "No orders yet"} hint={search || status ? "Try changing the search or status filter." : "Orders appear here once the checkout finishes."} />
      ) : (
      <div className="overflow-x-auto">
        {refreshing && <p className="px-2 pb-2 text-xs text-[#8a8a8a]" role="status">Updating orders…</p>}
        <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#ececec] text-[#8a8a8a] dark:border-[#262626] dark:text-[#9a9a9a]">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o._id} className="border-b border-[#f2f2f2] transition-colors hover:bg-white dark:border-[#1f1f1f] dark:hover:bg-[#121212]">
                  <td className="px-4 py-3 font-semibold text-black dark:text-white">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-[#484848] dark:text-[#ccc]">
                    {o.customer.firstName} {o.customer.lastName} · <span className="max-w-[240px] truncate">{o.customer.email}</span>
                  </td>
                  <td className="px-4 py-3 text-[#484848] dark:text-[#ccc]">{o.items.length} item(s)</td>
                  <td className="px-4 py-3 font-semibold text-black dark:text-white">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white dark:placeholder:text-[#5f5f5f]"
                      value={o.status}
                      onChange={(e) => changeStatus(o, e.target.value)}
                      disabled={updating === o._id}>
                      {(o.status === "cancelled" ? ["cancelled"] : STATUSES).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">          <button
                      type="button"
                      onClick={() => openDetail(o)}
                      className="inline-flex items-center gap-1 text-[#fca120] hover:underline">
                      <LuSearch size={14} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <Drawer open={!!detail} onClose={closeDetail} title={`Order ${detail.orderNumber}`}>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-2">
            <div className="flex gap-3">
              <dt className="text-[#9a9a9a] dark:text-[#aaa]">Customer</dt>
              <dd className="text-[#1a1a1a] dark:text-white">{detail.customer.firstName} {detail.customer.lastName} · {detail.customer.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-[#9a9a9a] dark:text-[#aaa]">Delivery address</dt>
              <dd className="text-[#1a1a1a] dark:text-white">{detail.customer.address}, {detail.customer.city} {detail.customer.postal}, {detail.customer.country}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-[#9a9a9a] dark:text-[#aaa]">Payment</dt>
              <dd className="text-[#1a1a1a] dark:text-white">{detail.paymentMethod}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-[#9a9a9a] dark:text-[#aaa]">Coupon</dt>
              <dd className="text-[#1a1a1a] dark:text-white">{detail.discountCode ? `${detail.discountCode} · -$${detail.discount.toFixed(2)}` : "—"}</dd>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <dt className="text-[#9a9a9a] dark:text-[#aaa]">Status</dt>
              <dd className="flex items-center gap-2">
                <select
                  className={inputCls}
                  value={detail.status}
                  onChange={(e) => changeStatus(detail, e.target.value)}
                  disabled={updating === detail._id}>
                  {(detail.status === "cancelled" ? ["cancelled"] : STATUSES).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Badge kind={detail.status}>{detail.status}</Badge>
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-[#ececec] pt-5 dark:border-[#262626]">
            <h4 className="font-semibold text-[#1a1a1a] dark:text-white mb-3">Items ({detail.items.length})</h4>
            <ul className="space-y-3">
              {detail.items.map((item) => (
                <li key={`${item.productId}:${item.size}:${item.color}`} className="flex gap-3">
                  <img src={item.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#1a1a1a] dark:text-white">{item.title}</p>
                    <p className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">{item.category} · size {item.size || "—"} · colour {item.color || "—"}</p>
                    <p className="text-[13px] font-semibold text-black dark:text-white">${item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-[#ececec] pt-5 text-[14px] dark:border-[#262626]">
            <div className="flex items-center justify-between">
              <span className="text-[#9a9a9a] dark:text-[#aaa]">Subtotal</span>
              <span className="font-semibold text-[#1a1a1a] dark:text-white">${detail.subtotal.toFixed(2)}</span>
            </div>
            {detail.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#9a9a9a] dark:text-[#aaa]">Discount</span>
                <span className="font-semibold text-[#1a1a1a] dark:text-white">-${detail.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#9a9a9a] dark:text-[#aaa]">Shipping</span>
              <span className="font-semibold text-[#1a1a1a] dark:text-white">${detail.shipping.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#ececec] pt-3 dark:border-[#262626]">
              <span className="font-semibold text-[#1a1a1a] dark:text-white">Total</span>
              <span className="font-Display text-[26px] text-black dark:text-white">${detail.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="button" className={btnDark} onClick={closeDetail}>Close</button>
          </div>
        </Drawer>
      )}
    </div>
  )
}
