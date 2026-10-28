import { useEffect, useState } from "react"
import { Link } from "react-router"
import { getStats, getOrders } from "../../api/backend"
import { Badge, Spinner, card, SectionTitle } from "./adminUi"

// Hand-rolled SVG charts: no extra dependency — an area chart for the last 7
// days of revenue and a donut for the order-status split.
const AreaChart = ({ data, height = 220 }) => {
  if (!data?.length) return <p className="py-6 text-[14px] text-[#9a9a9a]">No sales yet this week</p>
  const W = 640,
    H = height,
    pad = { top: 16, bottom: 34, left: 14, right: 14 }
  const max = Math.max(...data.map((d) => d.revenue), 1)
  const steps = data.length - 1
  const pts = data.map((d, i) => {
    const x = pad.left + (i / steps) * (W - pad.left - pad.right)
    const y = H - pad.bottom - (d.revenue / max) * (H - pad.top - pad.bottom)
    return { x, y, ...d }
  })
  const line = pts.map((p) => `${p.x},${p.y}`).join(" L ")
  const area = `${line} L ${pts[pts.length - 1].x},${H - pad.bottom} L ${pts[0].x},${H - pad.bottom} Z`
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" height={height}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca120" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fca120" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#grad)" />
        <path d={line} fill="none" stroke="#fca120" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#fca120" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-[#9a9a9a]">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-end gap-1">
            <span className="text-[12px] font-medium text-black dark:text-white">${d.revenue.toLocaleString()}</span>
            <div
              className="w-[3px] rounded-t-[3px] bg-[#fca120]"
              style={{ height: `${(d.revenue / max) * 120}px` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

const Donut = ({ data, size = 190 }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  let acc = 0
  const slices = Object.entries(data).map(([label, count]) => {
    const start = acc
    acc += count
    const frac = count / total
    const startAngle = -Math.PI / 2 + start * Math.PI * 2
    const endAngle = startAngle + frac * Math.PI * 2
    return { label, count, color: COLORS[label], startAngle, endAngle }
  })
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="-1 -1 2 2" className="w-full h-full">
          {slices.map((s, i) => {
            const large = (s.endAngle - s.startAngle) > Math.PI
            const x1 = Math.cos(s.startAngle)
            const y1 = Math.sin(s.startAngle)
            const x2 = Math.cos(s.endAngle)
            const y2 = Math.sin(s.endAngle)
            return (
              <path
                key={i}
                d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${large ? 1 : 0} 1 ${x2} ${y2} Z`}
                fill={s.color}
                stroke="#fff"
                strokeWidth="2"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-Display font-bold text-black dark:text-white">{total}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9a9a9a]">Orders</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(data).map(([label, count]) => (
          <div key={label} className="flex items-center gap-1.5 text-[12px]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[label] }} />
            <span className="text-[#6a6a6a] dark:text-[#a5a5a5]">{label}</span>
            <span className="font-semibold text-black dark:text-white">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const COLORS = {
  pending: "#fca120",
  confirmed: "#5b9bff",
  packed: "#7c6cf0",
  shipped: "#9f7aea",
  delivered: "#34d399",
  cancelled: "#f87171",
}

export default function Overview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getStats()
      .then((res) => {
        if (!alive) return
        setStats(res?.success ? res.stats : null)
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false))

    getOrders({ status: "", search: "" })
      .then((res) => {
        if (!alive) return
        setStats(res?.success ? res.stats : null)
      })
      .finally(() => {})
    return () => { alive = false }
  }, [])

  if (loading) return <Spinner />
  if (!stats) return <p className="py-12 text-[15px] text-[#9a9a9a]">Couldn&apos;t load the dashboard — is the backend running?</p>

  const { counts, revenue, ordersByStatus, topItems, lowStock } = stats
  const pending = counts.pending || 0

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Overview"
        subtitle="Everything at a glance — totals, sales trend and where your orders are in the pipeline."
        action={
          <Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-[8px] bg-black px-4 py-2.5 text-[13px] font-medium text-white dark:bg-[#fca120] dark:text-black hover:bg-[#2d2d2d]">
            <LuShoppingBag size={16} /> View orders
          </Link>
        }>
        <LuLayoutDashboard size={16} />
      </SectionTitle>

      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8a8a8a] dark:text-[#9a9a9a]">Revenue</p>
            <span className="h-9 w-9 rounded-full bg-[#fca120]/15 text-[#fca120] flex items-center justify-center"><span className="text-sm font-bold">$</span></span>
          </div>
          <p className="mt-2 font-Display text-[30px] leading-none text-black dark:text-white">${revenue.toLocaleString()}</p>
          <p className="mt-1 text-[12px] text-[#9a9a9a] dark:text-[#aaa]">from {ordersByStatus.delivered || 0} delivered orders</p>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8a8a8a] dark:text-[#9a9a9a]">Orders</p>
            <span className="h-9 w-9 rounded-full bg-white border text-[#484848] flex items-center justify-center dark:border-[#333] dark:text-[#ccc]"><span className="text-sm font-bold">{counts.orders || 0}</span></span>
          </div>
          <p className="mt-2 text-2xl font-bold text-black dark:text-white">{counts.orders || 0}</p>
          <p className="mt-1 text-[12px] text-[#9a9a9a] dark:text-[#aaa]">{pending} still pending or confirmed</p>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8a8a8a] dark:text-[#9a9a9a]">Products</p>
            <span className="h-9 w-9 rounded-full bg-white border text-[#484848] flex items-center justify-center dark:border-[#333] dark:text-[#ccc]"><span className="text-sm font-bold">{counts.products || 0}</span></span>
          </div>
          <p className="mt-2 text-2xl font-bold text-black dark:text-white">{counts.products || 0}</p>
          <p className="mt-1 text-[12px] text-[#9a9a9a] dark:text-[#aaa]">{counts.categories || 0} categories</p>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8a8a8a] dark:text-[#9a9a9a]">Customers</p>
            <span className="h-9 w-9 rounded-full bg-white border text-[#484848] flex items-center justify-center dark:border-[#333] dark:text-[#ccc]"><span className="text-sm font-bold">{counts.users || 0}</span></span>
          </div>
          <p className="mt-2 text-2xl font-bold text-black dark:text-white">{counts.users || 0}</p>
          <p className="mt-1 text-[12px] text-[#9a9a9a] dark:text-[#aaa]">{counts.subscribers || 0} subscribers</p>
        </div>
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className={card}>
          <h3 className="font-semibold text-black dark:text-white">Sales last 7 days</h3>
          <div className="mt-4"><AreaChart data={stats.trend} /></div>
        </div>
        <div className={card}>
          <h3 className="font-semibold text-black dark:text-white">Orders by status</h3>
          <div className="mt-4"><Donut data={ordersByStatus} /></div>
        </div>
      </div>

      {/* actions — low stock, top sellers, recent orders */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black dark:text-white">Low stock</h3>
            <Link to="/admin/products" className="text-[12px] font-medium text-[#fca120] hover:underline">Manage</Link>
          </div>
          {lowStock.length ? (
            <ul className="space-y-2.5">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="h-9 w-9 rounded-lg bg-[#f4f4f4] text-[#9a9a9a] flex shrink-0 items-center justify-center dark:bg-[#242424] dark:text-[#aaa]">
                      {p.title.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate text-[13px] font-medium text-[#484848] dark:text-[#ccc]">{p.title}</span>
                  </div>
                  <span className={`text-[13px] font-semibold ${p.stock <= 2 ? "text-[#f87171]" : "text-[#fca120]"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[13px] text-[#9a9a9a]">All stocked product(s) healthy</p>
          )}
        </div>

        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black dark:text-white">Top sellers</h3>
            <Link to="/admin/products" className="text-[12px] font-medium text-[#fca120] hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {topItems.map((item) => (
              <li key={item._id} className="flex items-center gap-3">
                <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#484848] dark:text-[#ccc]">{item.title}</p>
                  <p className="text-[11px] text-[#9a9a9a]">{item.sold} sold</p>
                </div>
                <span className="text-[13px] font-semibold text-black dark:text-white">${item.revenue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black dark:text-white">Recent orders</h3>
            <Link to="/admin/orders" className="text-[12px] font-medium text-[#fca120] hover:underline">See all</Link>
          </div>
          <ul className="space-y-3">
            {stats.recentOrders?.map((o) => (
              <li key={o._id} className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f4f4f4] text-[#9a9a9a] dark:bg-[#242424] dark:text-[#aaa]">
                  {o.orderNumber.slice(2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#484848] dark:text-[#ccc]">{o.orderNumber} — {o.customer.firstName} {o.customer.lastName}</p>
                  <p className="text-[11px] text-[#9a9a9a]">{o.customer.email} · {o.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-black dark:text-white">${o.total.toFixed(2)}</p>
                  <Badge kind={o.status}>{o.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
