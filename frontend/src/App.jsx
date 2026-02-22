import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import useUserStore from './store/useUserStore';
import NotFound from './pages/NotFound';

function App() {
  const user = useUserStore(state => state.user);

  return (
    <Router>
      <Toaster position="top-right" />
      <div className='min-h-screen bg-gray-50 font-sans'>
        <Routes>
          <Route path='/' element={user ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          <Route path='/dashboard' element={
            <ProtectedRoute allowedRoles={['DONANTE', 'RECOLECTOR']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Fallback routes para limpiar caché de usuarios */}
          <Route path='/feed' element={<Navigate to="/dashboard" replace />} />
          <Route path='/donante' element={<Navigate to="/dashboard" replace />} />

          {/* 404 Error Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
