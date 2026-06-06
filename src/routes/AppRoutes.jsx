import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Login from '../pages/Login/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import Packages from '../pages/Packages/Packages'
import Destinations from '../pages/Destinations/Destinations'
import AdminBlogs from '../pages/Blogs/AdminBlogs'
import Contacts from '../pages/Contacts/Contacts'
import Bookings from '../pages/Bookings/Bookings'
import Searches from '../pages/Searches/Searches'
import Theme from '../pages/Theme/Theme'
import SiteContent from '../pages/SiteContent/SiteContent'
import QuotationDownloads from '../pages/QuotationDownloads/QuotationDownloads'

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
          <Route path="contacts" element={<Contacts />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="searches" element={<Searches />} />
          <Route path="quotation-downloads" element={<QuotationDownloads />} />
          <Route path="theme" element={<Theme />} />
          <Route path="content" element={<SiteContent />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
