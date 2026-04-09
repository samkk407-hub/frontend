
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Profile() {
  const { status, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/shop/dashboard/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p>Status: {status}</p>
      {status !== 'active' && <p>Your account is pending activation. Please contact admin.</p>}
      <Button onClick={handleLogout} className="mt-4">Logout</Button>
    </div>
  )
}
