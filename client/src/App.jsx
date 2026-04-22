import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ServerWakingOverlay from './components/ServerWakingOverlay.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import RateLimitOverlay from './components/RateLimitOverlay.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage.jsx';
import ManageServicesPage from './pages/admin/ManageServicesPage.jsx';
import OperatingHoursPage from './pages/admin/OperatingHoursPage.jsx';
import ManageBookingsPage from './pages/admin/ManageBookingsPage.jsx';
import AdminBookingPage from './pages/admin/AdminBookingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const FULL_BLEED = ['/', '/login', '/register'];
const NO_NAVBAR = []; // Add paths here if we ever need to hide navbar

function Layout() {
  const location = useLocation();
  const isFullBleed = FULL_BLEED.includes(location.pathname);

  return (
    <div className="min-h-screen bg-bg-dark">
      <OfflineBanner />
      <Navbar />
      <div className={isFullBleed ? '' : 'container mx-auto p-4 pb-8'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/book/:serviceId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly><ManageCategoriesPage /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute adminOnly><ManageServicesPage /></ProtectedRoute>} />
          <Route path="/admin/operating-hours" element={<ProtectedRoute adminOnly><OperatingHoursPage /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><ManageBookingsPage /></ProtectedRoute>} />
          <Route path="/admin/quick-booking" element={<ProtectedRoute adminOnly><AdminBookingPage /></ProtectedRoute>} />
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <ServerWakingOverlay />
      <RateLimitOverlay />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
