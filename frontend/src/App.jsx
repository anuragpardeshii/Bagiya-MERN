import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './Dashboard/context/AuthContext';
import ProtectedRoute from './Dashboard/context/ProtectedRoute';
import Sidebar from './Dashboard/Sidebar';
import { Loading } from './components/UI';
const Home = lazy(() => import('./Home/Home'));
const Login = lazy(() => import('./Login/Login'));
const Signup = lazy(() => import('./Signup/Signup'));
const Dashboard = lazy(() => import('./Dashboard/Dashboard/Dashboard'));
const Timer = lazy(() => import('./Times'));
const Garden = lazy(() => import('./Dashboard/Bagiya/Bagiya'));
const Profile = lazy(() => import('./Dashboard/Profile/Profile'));
const Friends = lazy(() => import('./Dashboard/Friends/Friends'));
const Rankings = lazy(() => import('./Dashboard/Rankings/Rankings'));
const Challenges = lazy(() => import('./Challenges/Challenges'));
const NotFound = lazy(() => import('./NotFound'));
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#244b38',
              color: '#fff',
            },
          }}
        />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Sidebar />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/timer" element={<Timer />} />
                <Route path="/dashboard/bagiya" element={<Garden />} />
                <Route path="/dashboard/profile" element={<Profile />} />
                <Route path="/dashboard/friends" element={<Friends />} />
                <Route path="/dashboard/rankings" element={<Rankings />} />
                <Route path="/dashboard/challenges" element={<Challenges />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
