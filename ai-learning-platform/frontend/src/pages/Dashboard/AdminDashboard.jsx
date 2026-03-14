import { useEffect, useState } from 'react'
import client from '../../api/client'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    client.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(err => {
        console.error('Failed to load users:', err)
        setUsers([])
      })
  }, [])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="card">
        <h2 className="font-semibold mb-4">All Users</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">{['Name','Email','Role','Status'].map(h=><th key={h} className="pb-2 pr-4">{h}</th>)}</tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u.id} className="border-b last:border-0">
              <td className="py-2 pr-4">{u.full_name}</td>
              <td className="py-2 pr-4 text-gray-500">{u.email}</td>
              <td className="py-2 pr-4 capitalize">{u.role}</td>
              <td className="py-2"><span className={`text-xs px-2 py-1 rounded-full ${u.is_active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{u.is_active?'Active':'Inactive'}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
