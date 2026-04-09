import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import ShopRegister  from "./pages/ShopRegister";
import ShopDashboard from "./pages/ShopDashboard";
import ShopLogin from "./pages/ShopLogin";
import Profile from "./pages/Profile";
export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/shop/dashboard/login" element={<ShopLogin />} />
          <Route path="/shop/dashboard/register" element={<ShopRegister />} />
          <Route path="/shop/dashboard" element={
            <ProtectedRoute requireActive>
              <ShopDashboard />
            </ProtectedRoute>
          } />
          <Route path="/shop/dashboard/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


