import { useEffect, useState } from "react"
import { LuPen, LuTrashAlt, LuPlus } from "react-icons/lu"
import { toast } from "react-toastify"
import { createCategory, getCategories, updateCategory, deleteCategory } from "../../api/backend"
import { Badge, EmptyState, SectionTitle, Spinner, card, btnDark, ConfirmDialog } from "./adminUi"

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [popup, setPopup] = useState(null) // { id, name }
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    let alive = true
    getCategories()
      .then((res) => {
        if (!alive) return
        setCategories(res?.success ? res.category : [])
      })
      .finally(() => setLoading(false))
    return () => { alive = false }
  }, [])

  const refresh = () => {
    getCategories()
      .then((res) => setCategories(res?.success ? res.category : []))
      .catch(() => setCategories([]))
  }

  const startRename = (c) => {
    // inline edit: open a small input panel for this category
    setPopup({ id: c._id, name: c.categoryName })
  }

  const commitRename = async (id, name) => {
    if (!name.trim()) return
    setBusy(true)
    const res = await updateCategory(id, name.trim())
    setBusy(false)
    if (res?.success) {
      toast.success("Category renamed")
      setPopup(null)
      refresh()
    } else {
      toast.error(res?.message || "Could not rename")
    }
  }

  const commitAdd = async () => {
    if (!popup?.name || popup.name.trim() === "") return
    setBusy(true)
    const res = await createCategory(popup.name.trim())
    setBusy(false)
    if (res?.success) {
      toast.success("Category created")
      setPopup(null)
      refresh()
    } else {
      toast.error(res?.message || "Category already exists")
    }
  }

  // unused: the inline panel mutates popup directly

  const remove = async (id, name) => {
    setConfirm({ id, name })
  }
  const confirmRemove = async () => {
    if (!confirm) return
    const res = await deleteCategory(confirm.id)
    setConfirm(null)
    if (res?.success) {
      toast.success("Category deleted")
      refresh()
    } else {
      toast.error(res?.message || "Could not delete — check the message")
    }
  }

  if (loading) return <Spinner />
  if (categories.length === 0) return <EmptyState title="No categories yet" hint="Create the first category for the store." />

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Categories"
        subtitle="The filter pills on the shop page come straight from this list — edit or delete with one click."
        action={          <button type="button" className={btnDark} onClick={() => setPopup({ id: "", name: "" })}>
            <LuPlus size={16} /> Add Category
          </button>
        }>
          <LuPlus size={16} />
        </SectionTitle>
      <div className="mt-4 flex justify-end">
        <button type="button" className={btnDark} onClick={commitAdd} disabled={busy}>
          Add Category
        </button>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" className={btnDark} onClick={commitAdd} disabled={busy}>
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <div key={c._id} className={card}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fca120]/15 text-[#fca120]">
                  <LuPen size={17} />
                </div>
                <span className="font-semibold text-[#1a1a1a] dark:text-white">{c.categoryName}</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => startRename(c)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#fca120] dark:hover:bg-[#242424]">
                  <LuPen size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(c._id, c.categoryName)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-[#f87171]/15 hover:text-[#f87171] dark:hover:bg-[#f87171]/20">
                  <FaTrashAlt size={15} />
                </button>
              </div>
            </div>

            {/* inline edit panel inside the card */}
            {popup?._id === c._id && (
              <div className="mt-3 border-t border-[#ececec] pt-3 dark:border-[#262626]">
                <div className="flex items-center gap-2">
            <input
              className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
                    autoFocus
                    value={popup.name}
                    onChange={(e) => setPopup({ ...popup, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(popup.id, popup.name)
                      if (e.key === "Escape") setPopup(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={() => commitRename(popup.id, popup.name)}
                    className="text-[13px] font-semibold text-black dark:text-white"
                    disabled={busy}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopup(null)}
                    className="text-[13px] text-[#9a9a9a] hover:underline"
                    disabled={busy}>
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Delete category?"
        message="This won’t affect products in this category — they’ll just drop into the default channel. Type the category name to confirm:"
        onConfirm={confirmRemove}
        onCancel={() => setConfirm(null)}
        busy={busy}
      />
    </div>
  )
}
