
import { useEffect, useState } from "react"
import { LuPen, LuTrash2, LuPlus, LuCheck, LuX, LuRefreshCw } from "react-icons/lu"
import { toast } from "react-toastify"
import {
  createCategory,
  getCategoryList,
  updateCategory,
  deleteCategory,
} from "../../api/backend"
import {
  EmptyState,
  SectionTitle,
  Spinner,
  card,
  btnDark,
  ConfirmDialog,
} from "./adminUi"

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [popup, setPopup] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState("")

  const loadCategories = async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setLoadError("")
    try {
      const res = await getCategoryList()

      if (Array.isArray(res)) {
        setCategories(res)
      } else {
        setLoadError("Could not load categories. Check the backend connection.")
      }
    } catch {
      setLoadError("Could not load categories. Check the backend connection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const openAdd = () => {
    setPopup({ id: "", name: "" })
  }

  const startRename = (category) => {
    setPopup({
      id: category._id,
      name: category.categoryName,
    })
  }

  const cancelEdit = () => {
    if (!busy) setPopup(null)
  }

  const saveCategory = async () => {
    const name = popup?.name?.trim()

    if (!name) {
      toast.error("Please enter a category name")
      return
    }

    setBusy(true)

    try {
      const res = popup.id
        ? await updateCategory(popup.id, name)
        : await createCategory(name)

      if (!res?.success) {
        toast.error(
          res?.message ||
            (popup.id
              ? "Could not rename category"
              : "Could not create category")
        )
        return
      }

      toast.success(
        popup.id ? "Category renamed" : "Category created"
      )

      setPopup(null)
      window.dispatchEvent(new Event("fasco:catalog:updated"))
      await loadCategories(true)
    } catch {
      toast.error("Could not connect to the server")
    } finally {
      setBusy(false)
    }
  }

  const remove = (id, name) => {
    setConfirm({ id, name })
  }

  const confirmRemove = async () => {
    if (!confirm || busy) return

    setBusy(true)

    try {
      const res = await deleteCategory(confirm.id)

      if (!res?.success) {
        toast.error(res?.message || "Could not delete category")
        return
      }

      toast.success("Category deleted")
      setConfirm(null)
      window.dispatchEvent(new Event("fasco:catalog:updated"))
      await loadCategories(true)
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
        title="Categories"
        subtitle="The filter pills on the shop page come straight from this list — edit or delete with one click."
        action={
          <div className="flex gap-2">
            <button type="button" className={btnDark} onClick={() => loadCategories(true)} disabled={refreshing}>
              <LuRefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <button type="button" className={btnDark} onClick={openAdd}>
              <LuPlus size={16} /> Add Category
            </button>
          </div>
        }
      />

      {loadError ? (
        <div className={`${card} p-6 text-center`}>
          <p className="text-sm text-[#b91c1c]">{loadError}</p>
          <button type="button" className={`${btnDark} mt-4`} onClick={() => loadCategories(true)} disabled={refreshing}>
            Retry
          </button>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          hint="Create the first category for the store."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div key={category._id} className={card}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fca120]/15 text-[#fca120]">
                    <LuPen size={17} />
                  </div>

                  <span className="break-words font-semibold text-[#1a1a1a] dark:text-white">
                    {category.categoryName}
                  </span>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => startRename(category)}
                    aria-label={`Rename ${category.categoryName}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#fca120] dark:hover:bg-[#242424]"
                  >
                    <LuPen size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(category._id, category.categoryName)
                    }
                    aria-label={`Delete ${category.categoryName}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-[#f87171]/15 hover:text-[#f87171] dark:hover:bg-[#f87171]/20"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>

              {popup?.id === category._id && (
                <div className="mt-3 border-t border-[#ececec] pt-3 dark:border-[#262626]">
                  <CategoryNameForm
                    value={popup.name}
                    onChange={(name) =>
                      setPopup((current) => ({
                        ...current,
                        name,
                      }))
                    }
                    onSave={saveCategory}
                    onCancel={cancelEdit}
                    busy={busy}
                    editing
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {popup?.id === "" && (
        <div className={`${card} space-y-4`}>
          <h3 className="font-semibold text-[#1a1a1a] dark:text-white">
            Add a new category
          </h3>

          <CategoryNameForm
            value={popup.name}
            onChange={(name) =>
              setPopup((current) => ({
                ...current,
                name,
              }))
            }
            onSave={saveCategory}
            onCancel={cancelEdit}
            busy={busy}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete category?"
        message={
          confirm
            ? `Are you sure you want to delete "${confirm.name}"? This may affect how products in this category appear in the store.`
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

function CategoryNameForm({
  value,
  onChange,
  onSave,
  onCancel,
  busy,
  editing = false,
}) {
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
    >
      <input
        className="min-w-0 flex-1 rounded-[5px] border border-[#e2e2e2] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel()
        }}
        placeholder="Enter category name"
        maxLength={80}
        disabled={busy}
      />

      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="inline-flex items-center gap-1 rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
      >
        <LuCheck size={15} />
        {busy ? "Saving..." : editing ? "Save" : "Create"}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        aria-label="Cancel"
        className="grid h-9 w-9 place-items-center rounded-lg text-[#8a8a8a] hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
      >
        <LuX size={16} />
      </button>
    </form>
  )
}
