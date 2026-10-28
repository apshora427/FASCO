import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { LuPlus, LuEdit, LuTrashAlt, LuCheck, LuTimes } from "react-icons/lu"
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../api/backend"
import { Badge, EmptyState, SectionTitle, Spinner, card, btnDark, ConfirmDialog, Modal } from "./adminUi"

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ code: "", discount: "", description: "", active: true, expiresAt: "" })
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    let alive = true
    getCoupons()
      .then((res) => {
        if (!alive) return
        setCoupons(res?.success ? res.coupons : [])
      })
      .finally(() => setLoading(false))
    return () => { alive = false }
  }, [])

  const refresh = () => {
    getCoupons()
      .then((res) => setCoupons(res?.success ? res.coupons : []))
      .catch(() => setCoupons([]))
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code,
      discount: String(c.discount),
      description: c.description || "",
      active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    })
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.code.trim()) {
      toast.error("Coupon code is required")
      return
    }
    const discount = Number(form.discount)
    if (!Number.isFinite(discount) || discount <= 0 || discount > 1) {
      toast.error("Discount must be between 0 and 1 (e.g. 0.1 for 10%)")
      return
    }
    setBusy(true)
    const res = editing
      ? await updateCoupon(editing._id, {
          code: form.code.trim().toUpperCase(),
          discount,
          active: form.active,
          description: form.description.trim() || undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt + "T00:00:00") : null,
        })
      : await createCoupon({
          code: form.code.trim().toUpperCase(),
          discount,
          active: form.active,
          description: form.description.trim() || undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt + "T00:00:00") : null,
        })
    setBusy(false)
    if (res?.success) {
      toast.success(editing ? "Coupon updated" : "Coupon created")
      setEditing(null)
      setForm({ code: "", discount: "", description: "", active: true, expiresAt: "" })
      refresh()
    } else {
      toast.error(res?.message || "Could not save")
    }
  }

  const toggleActive = async (c) => {
    const res = await updateCoupon(c._id, { active: !c.active })
    if (res?.success) {
      toast.success(res.message || "Coupon updated")
      refresh()
    } else {
      toast.error(res?.message || "Could not toggle")
    }
  }

  const remove = async (id, code) => {
    setConfirm({ id, code })
  }
  const confirmRemove = async () => {
    if (!confirm) return
    const res = await deleteCoupon(confirm.id)
    setConfirm(null)
    if (res?.success) {
      toast.success("Coupon deleted")
      refresh()
    } else {
      toast.error(res?.message || "Could not delete")
    }
  }

  if (loading) return <Spinner />
  if (coupons.length === 0) return <EmptyState title="No coupons yet" hint="Create a discount code such as FASCO10 (10% off)." />

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Coupons"
        subtitle="Discount codes the checkout applies. FASCO10 (10% off) ships out-of-the-box from the storefront."
        action={
          <button type="button" className={btnDark} onClick={() => setEditing({ ...EMPTY_FORM, code: "" })}>
            <FaPlus size={16} /> New Coupon
          </button>
        }>
        <FaPlus size={16} />
      </SectionTitle>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {coupons.map((c) => (
          <div key={c._id} className={card}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fca120]/15 text-[#fca120]">
                  {c.active ? <FaCheck size={17} /> : <FaTimes size={17} />}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a1a1a] dark:text-white">{c.code}</h3>
                  <p className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">{c.description || "No description"}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#fca120] dark:hover:bg-[#242424]">
                  <FaEdit size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(c._id, c.code)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-[#f87171]/15 hover:text-[#f87171] dark:hover:bg-[#f87171]/20">
                  <FaTrashAlt size={15} />
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-[#ececec] pt-3 dark:border-[#262626]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-[#6a6a6a] dark:text-[#aaa]">Discount</span>
                <span className="text-[14px] font-bold text-black dark:text-white">
                  {c.discount === 1 ? "100%" : `${(c.discount * 100).toFixed(0)}%`}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[13px] text-[#6a6a6a] dark:text-[#aaa]">Status</span>
                <button
                  type="button"
                  onClick={() => toggleActive(c)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${c.active ? "bg-[#fca120]" : "bg-[#e2e2e2] dark:bg-[#333]"}`}>
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${c.active ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">Expires</span>
                <span className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">{c.expiresAt ? c.expiresAt.slice(0, 10) : "—"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? "Edit coupon" : "New coupon"}>
        <form className="grid grid-cols-1 gap-x-6 gap-y-4" onSubmit={save}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Code *</label>
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="FASCO10"
              required
            />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Discount % *</label>
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="10"
            />
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Active</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#e2e2e2] dark:border-[#333]"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span className="text-[13px] text-[#484848] dark:text-[#ccc]">Enable immediately</span>
            </div>
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Expires (date, optional)</label>
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">Description</label>
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="10% off your first order"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className={btnDark} onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="inline-flex items-center rounded-[8px] bg-black px-5 py-2.5 text-[13px] font-medium text-white dark:bg-[#fca120] dark:text-black">
              {busy ? "Saving…" : editing ? "Update coupon" : "Create coupon"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete coupon?"
        message={`This can’t be undone. All orders that already used ${confirm.code} are safe.`}
        onConfirm={confirmRemove}
        onCancel={() => setConfirm(null)}
        busy={busy}
      />
    </div>
  )
}

const EMPTY_FORM = { code: "", discount: "", description: "", active: true, expiresAt: "" }
