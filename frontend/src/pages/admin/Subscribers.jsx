import { useEffect, useState } from "react"
import { Link } from "react-router"
import { LuTrashAlt } from "react-icons/lu"
import { getSubscribers, deleteSubscriber } from "../../api/backend"
import { toast } from "react-toastify"
import { btnDark } from "./adminUi"
import { Card, EmptyState, SectionTitle, Spinner, ConfirmDialog } from "./adminUi"

export default function Subscribers() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    let alive = true
    getSubscribers()
      .then((res) => {
        if (!alive) return
        setList(res?.success ? res.subscribers : [])
      })
      .finally(() => setLoading(false))
    return () => { alive = false }
  }, [])

  const refresh = () => {
    getSubscribers()
      .then((res) => setList(res?.success ? res.subscribers : []))
      .catch(() => setList([]))
  }

  const remove = async (id, email) => {
    setConfirm({ id, email })
  }
  const confirmRemove = async () => {
    if (!confirm) return
    const res = await deleteSubscriber(confirm.id)
    setConfirm(null)
    if (res?.success) {
      toast.success("Subscriber removed")
      refresh()
    } else {
      toast.error(res?.message || "Could not remove")
    }
  }

  if (loading) return <Spinner />
  if (list.length === 0) return <EmptyState title="No subscribers yet" hint="People who signed up for the newsletter appear here." />

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Subscribers"
        subtitle="Everyone who subscribed to the newsletter — the list gets mailed the next time you send it."
        action={
          <Link to="/admin/users" className={btnDark}><FaTrashAlt size={16} /> Manage users</Link>
        }>
        <FaTrashAlt size={16} />
      </SectionTitle>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <Card key={s._id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#34d399]/15 text-[#34d399]">
                  <FaTrashAlt size={17} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a1a1a] dark:text-white">{s.email}</h3>
                  <p className="text-[12px] text-[#9a9a9a] dark:text-[#aaa]">{s.source} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(s._id, s.email)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#8a8a8a] transition-colors hover:bg-[#f87171]/15 hover:text-[#f87171] dark:hover:bg-[#f87171]/20">
                <FaTrashAlt size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Remove subscriber?"
        message={`This unsubscribes ${confirm.email} from future newsletters.`}
        onConfirm={confirmRemove}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
