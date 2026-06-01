import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Login from '../pages/Login/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import Packages from '../pages/Packages/Packages'
import Destinations from '../pages/Destinations/Destinations'
import AdminBlogs from '../pages/Blogs/AdminBlogs'
import Categories from '../pages/Categories/Categories'
import Contacts from '../pages/Contacts/Contacts'
import Bookings from '../pages/Bookings/Bookings'
import Theme from '../pages/Theme/Theme'

const isAuth = () => !!localStorage.getItem('admin_token')

function PrivateRoute({ children }) {
  return isAuth() ? children : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="packages" element={<Packages />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="categories" element={<Categories />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="theme" element={<Theme />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
