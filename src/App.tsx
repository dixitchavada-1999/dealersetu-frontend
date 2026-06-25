import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModulesProvider } from './contexts/ModulesContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ModuleGate from './components/ModuleGate';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyProducts = lazy(() => import('./pages/MyProducts'));
const Categories = lazy(() => import('./pages/Categories'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const Dispatch = lazy(() => import('./pages/Dispatch'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Promotions = lazy(() => import('./pages/Promotions'));
const Profile = lazy(() => import('./pages/Profile'));
const Cart = lazy(() => import('./pages/Cart'));
const Tenants = lazy(() => import('./pages/Tenants'));
const TenantDetail = lazy(() => import('./pages/TenantDetail'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Production = lazy(() => import('./pages/Production'));
const Marketing = lazy(() => import('./pages/Marketing'));
const Roles = lazy(() => import('./pages/Roles'));
const RoleEdit = lazy(() => import('./pages/RoleEdit'));
const ModuleStatusPage = lazy(() => import('./pages/ModuleStatus'));
const EmailTemplatesPage = lazy(() => import('./pages/EmailTemplates'));
const PlatformSettingsPage = lazy(() => import('./pages/PlatformSettings'));

function PageLoader() {
  return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-primary-600" size={28} /></div>;
}

function CatchAll() {
  const { isSuperAdmin } = useAuth();
  return <Navigate to={isSuperAdmin ? '/super-admin/tenants' : '/dashboard'} replace />;
}

function AppInner() {
  return (
    <>
      <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes (all authenticated users including customers) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="dashboard" label="Dashboard"><Dashboard /></ModuleGate></Suspense>} />
                <Route path="/products" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="products" label="Products"><Products /></ModuleGate></Suspense>} />
                <Route path="/my-products" element={<Suspense fallback={<PageLoader />}><MyProducts /></Suspense>} />
                <Route path="/products/:id" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="products" label="Products"><ProductDetail /></ModuleGate></Suspense>} />
                <Route path="/orders" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="orders" label="Orders"><Orders /></ModuleGate></Suspense>} />
                <Route path="/orders/:id" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="orders" label="Orders"><OrderDetail /></ModuleGate></Suspense>} />
                <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="notifications" label="Notifications"><Notifications /></ModuleGate></Suspense>} />
                <Route path="/feedback" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="feedback" label="Feedback"><Feedback /></ModuleGate></Suspense>} />
                <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
                <Route path="/cart" element={<Suspense fallback={<PageLoader />}><Cart /></Suspense>} />
              </Route>
            </Route>

            {/* Permission-gated management routes */}
            <Route element={<ProtectedRoute permission="categories.read" />}>
              <Route element={<Layout />}>
                <Route path="/categories" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="categories" label="Categories"><Categories /></ModuleGate></Suspense>} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute permission="customers.read" />}>
              <Route element={<Layout />}>
                <Route path="/customers" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="customers" label="Customers"><Customers /></ModuleGate></Suspense>} />
                <Route path="/customers/:id" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="customers" label="Customers"><CustomerDetail /></ModuleGate></Suspense>} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute permission="team.read" />}>
              <Route element={<Layout />}>
                <Route path="/dispatch" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="dispatch" label="Dispatch"><Dispatch /></ModuleGate></Suspense>} />
                <Route path="/production" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="production" label="Production"><Production /></ModuleGate></Suspense>} />
                <Route path="/marketing" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="marketing" label="Marketing"><Marketing /></ModuleGate></Suspense>} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute permission="banners.read" />}>
              <Route element={<Layout />}>
                <Route path="/promotions" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="promotions" label="Promotions"><Promotions /></ModuleGate></Suspense>} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute permission="settings.read" />}>
              <Route element={<Layout />}>
                <Route path="/settings" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="settings" label="Settings"><Settings /></ModuleGate></Suspense>} />
              </Route>
            </Route>

            {/* Roles & Permissions — accessible to anyone with roles.read (Owner + SuperAdmin) */}
            <Route element={<ProtectedRoute permission="roles.read" />}>
              <Route element={<Layout />}>
                <Route path="/roles" element={<Suspense fallback={<PageLoader />}><ModuleGate moduleKey="roles" label="Roles & Permissions"><Roles /></ModuleGate></Suspense>} />
                <Route path="/roles/new" element={<Suspense fallback={<PageLoader />}><RoleEdit /></Suspense>} />
                <Route path="/roles/:id" element={<Suspense fallback={<PageLoader />}><RoleEdit /></Suspense>} />
                <Route path="/roles/:id/edit" element={<Suspense fallback={<PageLoader />}><RoleEdit /></Suspense>} />
              </Route>
            </Route>

            {/* Super Admin routes */}
            <Route element={<ProtectedRoute superAdminOnly />}>
              <Route element={<Layout />}>
                <Route path="/super-admin/tenants" element={<Suspense fallback={<PageLoader />}><Tenants /></Suspense>} />
                <Route path="/super-admin/tenants/:id" element={<Suspense fallback={<PageLoader />}><TenantDetail /></Suspense>} />
                <Route path="/super-admin/activity-logs" element={<Suspense fallback={<PageLoader />}><ActivityLogs /></Suspense>} />
                <Route path="/super-admin/module-status" element={<Suspense fallback={<PageLoader />}><ModuleStatusPage /></Suspense>} />
                <Route path="/super-admin/email-templates" element={<Suspense fallback={<PageLoader />}><EmailTemplatesPage /></Suspense>} />
                <Route path="/super-admin/settings" element={<Suspense fallback={<PageLoader />}><PlatformSettingsPage /></Suspense>} />
              </Route>
            </Route>

            <Route path="*" element={<CatchAll />} />
          </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              autoHideDuration={3500}
            >
              <NotificationProvider>
                <ModulesProvider>
                  <AppInner />
                </ModulesProvider>
              </NotificationProvider>
            </SnackbarProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
