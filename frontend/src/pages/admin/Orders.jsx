import { useEffect, useState } from "react"
import { LuSearch } from "react-icons/lu"
import { toast } from "react-toastify"
import { getOrders, updateOrderStatus } from "../../api/backend"
import { Badge, EmptyState, SectionTitle, Spinner, Card, Drawer } from "./adminUi"
import { inputCls, btnDark } from "./adminUi"

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"]

export default function Orders() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [detail, setDetail] = useState(null)
  const [updating, setUpdating] = useState(null)

  // status is used inside the useEffect dependency array above

  useEffect(() => {
    let alive = true
    getOrders({ status, search })
      .then((res) => {
        if (!alive) return
        setList(res?.success ? res.orders : [])
      })
      .finally(() => setLoading(false))
    return () => { alive = false }
  }, [status, search])

  const filterStatus = (s) => {
    setStatus(s)
    getOrders({ status: s, search })
      .then((res) => {
        setList(res?.success ? res.orders : [])
      })
      .catch(() => setList([]))
  }

  const changeStatus = async (order, next) => {
    setUpdating(next)
    const res = await updateOrderStatus(order._id, next)
    setUpdating(null)
    if (res?.success) {
      toast.success(`Order marked ${next}`)
      const i = list.findIndex((o) => o._id === order._id)
      if (i !== -1) {
        const copy = [...list]
        copy[i] = { ...copy[i], status: next, updatedAt: new Date() }
        setList(copy)
      }
      if (detail?._id === order._id) setDetail({ ...detail, status: next })
    } else {
      toast.error(res?.message || "Could not update")
      setUpdating(null)
    }
  }

  const openDetail = (order) => setDetail(order)
  const closeDetail = () => setDetail(null)

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Orders"
        subtitle="Every sale, from the cart checkout → the MongoDB orders collection. Move them through the pipeline here."
        action={
          <div className="flex flex-wrap gap-3">
            <select className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white" value={status} onChange={(e) => filterStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="relative">
              <FaSearch
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
        <FaSearch size={16} />
      </SectionTitle>

      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState title="No orders yet" hint="Orders appear here once the checkout finishes." />
      ) : (
      <div className="overflow-x-auto">
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
                      disabled={updating === o.status}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">          <button
                      type="button"
                      onClick={() => openDetail(o)}
                      className="inline-flex items-center gap-1 text-[#fca120] hover:underline">
                      <FaSearch size={14} /> Detail
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
                  disabled={updating === detail.status}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Badge kind={detail.status}>{detail.status}</Badge>
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-[#ececec] pt-5 dark:border-[#262626]">
            <h4 className="font-semibold text-[#1a1a1a] dark:text-white mb-3">Items ({detail.items.length})</h4>
            <ul className="space-y-3">
              {detail.items.map((item) => (
                <li key={item.productId} className="flex gap-3">
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
