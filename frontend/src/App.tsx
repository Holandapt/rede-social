import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import Users from './pages/Users'
import FollowList from './pages/FollowList'


function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Tudo que estiver dentro desta rota exige sessão autenticada */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id/followers" element={<FollowList tipo="followers" />} />
        <Route path="/users/:id/following" element={<FollowList tipo="following" />} />
      </Route>
    </Routes>
  )
}

export default App
