
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { LuTrash2, LuUserPlus, LuRefreshCw } from "react-icons/lu"
import { toast } from "react-toastify"
import { UseUser } from "../../context/UserContext"
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../../api/backend"
import {
  Badge,
  EmptyState,
  SectionTitle,
  Spinner,
  ConfirmDialog,
  btnDark,
} from "./adminUi"

export default function Users() {
  const { currentUser } = UseUser()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState("")

  const loadUsers = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setLoadError("")
    try {
      const res = await getUsers()
      if (res?.success) {
        setUsers(Array.isArray(res.users) ? res.users : [])
      } else {
        setLoadError(res?.message || "Could not load users. Check the backend connection.")
      }
    } catch {
      setLoadError("Could not load users. Check the backend connection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const changeRole = async (user, role) => {
    if (busy || role === user.role) return

    setBusy(true)

    try {
      const res = await updateUserRole(user.id || user._id, role)

      if (!res?.success) {
        toast.error(res?.message || "Could not change role")
        return
      }

      toast.success(res.message || "Role updated")

      setUsers((current) =>
        current.map((item) =>
          (item.id || item._id) === (user.id || user._id) ? { ...item, role } : item
        )
      )
    } catch {
      toast.error("Could not connect to the server")
    } finally {
      setBusy(false)
    }
  }

  const remove = (id, email) => {
    setConfirm({ id, email })
  }

  const confirmRemove = async () => {
    if (!confirm || busy) return

    setBusy(true)

    try {
      const res = await deleteUser(confirm.id)

      if (!res?.success) {
        toast.error(res?.message || "Could not delete user")
        return
      }

      toast.success("User deleted")
      setConfirm(null)
      await loadUsers(true)
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
        title="Users"
        subtitle="Manage registered accounts, update roles, and remove accounts."
        action={
          <div className="flex gap-2">
            <button type="button" className={btnDark} onClick={() => loadUsers(true)} disabled={refreshing}>
              <LuRefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <Link to="/admin/subscribers" className={btnDark}><LuUserPlus size={16} /> Subscribers</Link>
          </div>
        }
      />

      {loadError ? (
        <div className="rounded-[14px] border border-rose-200 bg-white p-6 text-center dark:border-rose-900 dark:bg-[#161616]">
          <p className="text-sm text-[#b91c1c]">{loadError}</p>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          hint="Signups appear here automatically."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#ececec] text-[#8a8a8a] dark:border-[#262626] dark:text-[#9a9a9a]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const isCurrentUser = String(user.id || user._id) === String(currentUser?.id || currentUser?._id)
                return (
                <tr
                  key={user.id || user._id}
                  className="border-b border-[#f2f2f2] transition-colors hover:bg-white dark:border-[#1f1f1f] dark:hover:bg-[#121212]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4f4f4] text-[#9a9a9a] dark:bg-[#242424] dark:text-[#aaa]">
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </div>

                      <span className="font-medium text-[#1a1a1a] dark:text-white">
                        {user.name || "Unnamed user"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[#484848] dark:text-[#ccc]">
                    {user.email}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      className="rounded-[5px] border border-[#e2e2e2] bg-white px-2 py-1 text-[13px] text-[#1a1a1a] outline-none focus:border-black disabled:opacity-50 dark:border-[#333] dark:bg-[#141414] dark:text-white"
                      value={user.role}
                      disabled={busy || isCurrentUser}
                      title={isCurrentUser ? "You cannot change your own role" : undefined}
                      onChange={(event) =>
                        changeRole(user, event.target.value)
                      }
                      aria-label={`Role for ${user.email}`}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      kind={user.isVerified ? "verified" : "unverified"}
                    >
                      {user.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-[#484848] dark:text-[#ccc]">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(user.id || user._id, user.email)}
                      disabled={busy || isCurrentUser}
                      className="inline-grid h-8 w-8 place-items-center rounded-lg text-[#f87171] hover:bg-[#f87171]/10 disabled:opacity-50"
                      title={isCurrentUser ? "You cannot delete your own account" : "Delete account"}
                      aria-label={`Delete account ${user.email}`}
                    >
                      <LuTrash2 size={15} />
                    </button>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete this account?"
        message={
          confirm
            ? `This cannot be undone. The account ${confirm.email} will be removed from the store.`
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
