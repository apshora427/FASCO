
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import { LuTrash2, LuMail, LuRefreshCw } from "react-icons/lu"
import {
  getSubscribers,
  deleteSubscriber,
} from "../../api/backend"
import { toast } from "react-toastify"
import {
  btnDark,
  Card,
  EmptyState,
  SectionTitle,
  Spinner,
  ConfirmDialog,
} from "./adminUi"

export default function Subscribers() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState("")

  const loadSubscribers = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setLoadError("")
    try {
      const res = await getSubscribers()
      if (!res?.success || !Array.isArray(res.subscribers)) {
        setLoadError(res?.message || "Could not load subscribers. Check the backend connection.")
        return
      }
      setList(res.subscribers)
    } catch {
      setLoadError("Could not load subscribers. Check the backend connection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadSubscribers() }, [loadSubscribers])

  const confirmRemove = async () => {
    if (!confirm || deleting) return

    setDeleting(true)

    try {
      const res = await deleteSubscriber(confirm.id)

      if (res?.success) {
        toast.success("Subscriber removed")
        setList((current) =>
          current.filter((subscriber) => subscriber._id !== confirm.id)
        )
        setConfirm(null)
      } else {
        toast.error(res?.message || "Could not remove subscriber")
      }
    } catch {
      toast.error("Could not remove subscriber")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Subscribers"
        subtitle="Everyone subscribed to your newsletter."
        action={
          <div className="flex gap-2">
            <button type="button" className={btnDark} onClick={() => loadSubscribers(true)} disabled={refreshing}>
              <LuRefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <Link to="/admin/users" className={btnDark}>Manage users</Link>
          </div>
        }
      >
        <LuMail size={18} />
      </SectionTitle>

      {loadError ? (
        <div className="rounded-[14px] border border-rose-200 bg-white p-6 text-center dark:border-rose-900 dark:bg-[#161616]">
          <p className="text-sm text-[#b91c1c]">{loadError}</p>
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="No subscribers yet" hint="People who sign up for the newsletter appear here." />
      ) : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((subscriber) => (
          <Card key={subscriber._id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#34d399]/15 text-[#34d399]">
                  <LuMail size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="break-all font-semibold text-[#1a1a1a] dark:text-white">
                    {subscriber.email}
                  </h3>

                  <p className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">
                    {subscriber.source || "Newsletter"} ·{" "}
                    {subscriber.createdAt
                      ? new Date(subscriber.createdAt).toLocaleDateString()
                      : "Date unavailable"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label={`Remove ${subscriber.email}`}
                disabled={deleting}
                onClick={() =>
                  setConfirm({
                    id: subscriber._id,
                    email: subscriber.email,
                  })
                }
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-[#f87171]/15 hover:text-[#f87171] disabled:opacity-50"
              >
                <LuTrash2 size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>}

      <ConfirmDialog
        open={!!confirm}
        title="Remove subscriber?"
        message={
          confirm
            ? `This unsubscribes ${confirm.email} from future newsletters.`
            : ""
        }
        onConfirm={confirmRemove}
        onCancel={() => {
          if (!deleting) setConfirm(null)
        }}
        busy={deleting}
      />
    </div>
  )
}
