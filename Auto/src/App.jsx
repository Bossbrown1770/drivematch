import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

// Layout
import Layout from '@/components/Layout';
import AdminLayout from '@/components/admin/AdminLayout';

// Public pages
import Home from '@/pages/Home';
import Inventory from '@/pages/Inventory';
import CarDetail from '@/pages/CarDetail';
import OrderPage from '@/pages/OrderPage';
import Profile from '@/pages/Profile';
import MyOrders from '@/pages/MyOrders';
import MyTestDrives from '@/pages/MyTestDrives';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCars from '@/pages/admin/AdminCars';
import AdminCarForm from '@/pages/admin/AdminCarForm';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTestDrives from '@/pages/admin/AdminTestDrives';
import TestDriveBooking from '@/pages/TestDriveBooking';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes with shared Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/order/:carId" element={<OrderPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/my-test-drives" element={<MyTestDrives />} />
          <Route path="/test-drive/:carId" element={<TestDriveBooking />} />
        </Route>

        {/* Auth routes – standalone (no Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes – protected by ProtectedRoute */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="cars" element={<AdminCars />} />
            <Route path="cars/new" element={<AdminCarForm />} />
            <Route path="cars/:id/edit" element={<AdminCarForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="test-drives" element={<AdminTestDrives />} />
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
