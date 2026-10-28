
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  LuPlus,
  LuPen,
  LuTrash2,
  LuCheck,
  LuX,
  LuRefreshCw,
} from "react-icons/lu"
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../api/backend"
import {
  EmptyState,
  SectionTitle,
  Spinner,
  card,
  btnDark,
  ConfirmDialog,
  Modal,
} from "./adminUi"

const EMPTY_FORM = {
  code: "",
  discount: "",
  description: "",
  active: true,
  expiresAt: "",
  minOrderAmount: "0",
  usageLimit: "",
}

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirm, setConfirm] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState("")

  const loadCoupons = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setLoadError("")
    try {
      const res = await getCoupons()
      if (res?.success && Array.isArray(res.coupons)) {
        setCoupons(res.coupons)
      } else {
        setLoadError(res?.message || "Could not load coupons. Check the backend connection.")
      }
    } catch {
      setLoadError("Could not load coupons. Check the backend connection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadCoupons() }, [loadCoupons])
  const refresh = () => loadCoupons(true)

  const openCreate = () => {
    setForm({ ...EMPTY_FORM })
    setEditing({ _id: null })
  }

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code || "",
      // The API uses a decimal: 0.1 means 10%.
      discount: String(Number(coupon.discount) * 100),
      description: coupon.description || "",
      active: coupon.active ?? true,
      expiresAt: coupon.expiresAt
        ? String(coupon.expiresAt).slice(0, 10)
        : "",
      minOrderAmount: String(coupon.minOrderAmount || 0),
      usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit),
    })
    setEditing(coupon)
  }

  const closeModal = () => {
    if (busy) return
    setEditing(null)
    setForm({ ...EMPTY_FORM })
  }

  const save = async (event) => {
    event.preventDefault()

    if (busy) return

    const code = form.code.trim().toUpperCase()
    if (!code) {
      toast.error("Coupon code is required")
      return
    }

    const percentage = Number(form.discount)
    if (
      form.discount === "" ||
      !Number.isFinite(percentage) ||
      percentage <= 0 ||
      percentage > 100
    ) {
      toast.error("Discount must be greater than 0 and at most 100%")
      return
    }
    const minOrderAmount = Number(form.minOrderAmount)
    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      toast.error("Minimum order amount must be a non-negative number")
      return
    }
    const usageLimit = form.usageLimit === "" ? null : Number(form.usageLimit)
    if (usageLimit !== null && (!Number.isSafeInteger(usageLimit) || usageLimit < 1)) {
      toast.error("Usage limit must be a positive whole number")
      return
    }

    setBusy(true)

    try {
      const payload = {
        code,
        // Send a decimal to the backend: 10% becomes 0.1.
        discount: percentage / 100,
        active: form.active,
        description: form.description.trim(),
        expiresAt: form.expiresAt
          ? new Date(`${form.expiresAt}T00:00:00`)
          : null,
        minOrderAmount,
        usageLimit,
      }

      const res = editing?._id
        ? await updateCoupon(editing._id, payload)
        : await createCoupon(payload)

      if (!res?.success) {
        toast.error(res?.message || "Could not save coupon")
        return
      }

      toast.success(
        editing?._id ? "Coupon updated" : "Coupon created"
      )

      setEditing(null)
      setForm({ ...EMPTY_FORM })
      await refresh()
    } catch {
      toast.error("Could not connect to the server")
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (coupon) => {
    if (busy) return

    setBusy(true)

    try {
      const res = await updateCoupon(coupon._id, {
        active: !coupon.active,
      })

      if (!res?.success) {
        toast.error(res?.message || "Could not update coupon")
        return
      }

      toast.success(res.message || "Coupon updated")
      await refresh()
    } catch {
      toast.error("Could not connect to the server")
    } finally {
      setBusy(false)
    }
  }

  const remove = (id, code) => {
    setConfirm({ id, code })
  }

  const confirmRemove = async () => {
    if (!confirm || busy) return

    setBusy(true)

    try {
      const res = await deleteCoupon(confirm.id)

      if (!res?.success) {
        toast.error(res?.message || "Could not delete coupon")
        return
      }

      toast.success("Coupon deleted")
      setConfirm(null)
      await refresh()
    } catch {
      toast.error("Could not connect to the server")
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Coupons"
        subtitle="Manage discount codes used during checkout."
        action={
          <div className="flex gap-2">
            <button type="button" className={btnDark} onClick={refresh} disabled={refreshing}>
              <LuRefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <button type="button" className={btnDark} onClick={openCreate}>
              <LuPlus size={16} /> New Coupon
            </button>
          </div>
        }
      />

      {loadError ? (
        <div className="rounded-[14px] border border-rose-200 bg-white p-6 text-center dark:border-rose-900 dark:bg-[#161616]">
          <p className="text-sm text-[#b91c1c]">{loadError}</p>
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState
          title="No coupons yet"
          hint="Create a discount code such as FASCO10 (10% off)."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <div key={coupon._id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fca120]/15 text-[#fca120]">
                    {coupon.active ? (
                      <LuCheck size={17} />
                    ) : (
                      <LuX size={17} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-[#1a1a1a] dark:text-white">
                      {coupon.code}
                    </h3>
                    <p className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">
                      {coupon.description || "No description"}
                    </p>
                    <p className="text-[11px] text-[#9a9a9a] dark:text-[#aaa]">
                      Min. order ${Number(coupon.minOrderAmount || 0).toFixed(2)} ·{" "}
                      {coupon.usageLimit == null
                        ? `${coupon.usageCount || 0} uses`
                        : `${coupon.usageCount || 0}/${coupon.usageLimit} uses`}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(coupon)}
                    aria-label={`Edit ${coupon.code}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#fca120] dark:hover:bg-[#242424]"
                  >
                    <LuPen size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(coupon._id, coupon.code)}
                    aria-label={`Delete ${coupon.code}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-[#f87171]/15 hover:text-[#f87171] dark:hover:bg-[#f87171]/20"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-[#ececec] pt-3 dark:border-[#262626]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[#6a6a6a] dark:text-[#aaa]">
                    Discount
                  </span>
                  <span className="text-[14px] font-bold text-black dark:text-white">
                    {`${(Number(coupon.discount) * 100).toFixed(0)}%`}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[#6a6a6a] dark:text-[#aaa]">
                    Status
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!coupon.active}
                    aria-label={`Toggle ${coupon.code}`}
                    disabled={busy}
                    onClick={() => toggleActive(coupon)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                      coupon.active
                        ? "bg-[#fca120]"
                        : "bg-[#e2e2e2] dark:bg-[#333]"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        coupon.active ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">
                    Expires
                  </span>
                  <span className="text-[13px] font-medium text-[#484848] dark:text-[#ccc]">
                    {coupon.expiresAt
                      ? String(coupon.expiresAt).slice(0, 10)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={closeModal}
        title={editing?._id ? "Edit coupon" : "New coupon"}
      >
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={save}
        >
          <label className="grid gap-1.5 text-[13px] font-medium text-[#484848] dark:text-[#ccc]">
            Code *
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
              placeholder="FASCO10"
              maxLength={50}
              required
              disabled={busy}
            />
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium text-[#484848] dark:text-[#ccc]">
            Discount (%) *
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={form.discount}
              onChange={(event) =>
                setForm({ ...form, discount: event.target.value })
              }
              placeholder="10"
              required
              disabled={busy}
            />
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium text-[#484848] dark:text-[#ccc]">
            Description
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="10% off your first order"
              disabled={busy}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[13px] font-medium text-[#484848] dark:text-[#ccc]">
              Minimum order amount ($)
              <input
                className="rounded-[5px] border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={(event) => setForm({ ...form, minOrderAmount: event.target.value })}
                required
                disabled={busy}
              />
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium text-[#484848] dark:text-[#ccc]">
              Maximum uses (blank for unlimited)
              <input
                className="rounded-[5px] border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
                type="number"
                min="1"
                step="1"
                value={form.usageLimit}
                onChange={(event) => setForm({ ...form, usageLimit: event.target.value })}
                disabled={busy}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[#484848] dark:text-[#ccc]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#e2e2e2] dark:border-[#333]"
              checked={form.active}
              onChange={(event) =>
                setForm({ ...form, active: event.target.checked })
              }
              disabled={busy}
            />
            Enable coupon immediately
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium text-[#484848] dark:text-[#ccc]">
            Expiration date (optional)
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              type="date"
              value={form.expiresAt}
              onChange={(event) =>
                setForm({ ...form, expiresAt: event.target.value })
              }
              disabled={busy}
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className={btnDark}
              onClick={closeModal}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center rounded-[8px] bg-black px-5 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 dark:bg-[#fca120] dark:text-black"
            >
              {busy
                ? "Saving…"
                : editing?._id
                  ? "Update coupon"
                  : "Create coupon"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete coupon?"
        message={
          confirm
            ? `This can't be undone. Existing orders that used ${confirm.code} are not changed.`
            : ""
        }
        onConfirm={confirmRemove}
        onCancel={() => {
          if (!busy) setConfirm(null)
        }}
        busy={busy}
      />
    </div>
  )
}
