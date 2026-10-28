import { useEffect, useState } from "react"
import { LuTrashAlt, LuCheck, LuTimes, LuUserPlus } from "react-icons/lu"
import { getUsers, updateUserRole, deleteUser } from "../../api/backend"
import { Badge, EmptyState, SectionTitle, Spinner, ConfirmDialog } from "./adminUi"
import { toast } from "react-toastify"
import { btnDark } from "./adminUi"

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    let alive = true
    getUsers()
      .then((res) => {
        if (!alive) return
        setUsers(res?.success ? res.users : [])
      })
      .finally(() => setLoading(false))
    return () => { alive = false }
  }, [])

  const refresh = () => {
    getUsers()
      .then((res) => setUsers(res?.success ? res.users : []))
      .catch(() => setUsers([]))
  }

  const changeRole = async (user, role) => {
    const res = await updateUserRole(user._id, role)
    if (res?.success) {
      toast.success(res.message || "Role updated")
      const i = users.findIndex((u) => u._id === user._id)
      if (i !== -1) {
        const copy = [...users]
        copy[i] = { ...copy[i], role }
        setUsers(copy)
      }
    } else {
      toast.error(res?.message || "Could not change role")
    }
  }

  const remove = async (id, email) => {
    setConfirm({ id, email })
  }
  const confirmRemove = async () => {
    if (!confirm) return
    const res = await deleteUser(confirm.id)
    setConfirm(null)
    if (res?.success) {
      toast.success("User deleted")
      refresh()
    } else {
      toast.error(res?.message || "Could not delete")
    }
  }

  if (loading) return <Spinner />
  if (users.length === 0) return <EmptyState title="No accounts yet" hint="Signups appear here automatically." />

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Users"
        subtitle="Every account that has signed up — promote staff, demote, and remove accounts from here."
        action={
          <Link to="/admin/subscribers" className={btnDark}><LuUserPlus size={16} /> Subscribers</Link>
        }>
        <FaUserPlus size={16} />
      </SectionTitle>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#ececec] text-[#8a8a8a] dark:border-[#262626] dark:text-[#9a9a9a]">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Verified</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-[#f2f2f2] transition-colors hover:bg-white dark:border-[#1f1f1f] dark:hover:bg-[#121212]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4f4f4] text-[#9a9a9a] dark:bg-[#242424] dark:text-[#aaa]">
                      {(u.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[#1a1a1a] dark:text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#484848] dark:text-[#ccc]">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    className={`rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white`}
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Badge kind={u.isVerified ? "verified" : "unverified"}>
                    {u.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[#484848] dark:text-[#ccc]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove(u._id, u.email)}
                    className="text-[#f87171] hover:underline"
                    title="Delete account">
                    <FaTrashAlt size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this account?"
        message={`This cannot be undone. This email address will be removed from the store.`}
        onConfirm={confirmRemove}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
