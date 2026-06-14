import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Home from './pages/Home.jsx'
import Gallery from './pages/Gallery.jsx'
import Explorar from './pages/Explorar.jsx'
import Informacion from './pages/Informacion.jsx'
import Empresas from './pages/Empresas.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

function PrivateRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/informacion" element={<Informacion />} />
        <Route path="/empresas"    element={<Empresas />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/gallery"  element={<PrivateRoute><Gallery /></PrivateRoute>} />
        <Route path="/explorar" element={<PrivateRoute><Explorar /></PrivateRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
