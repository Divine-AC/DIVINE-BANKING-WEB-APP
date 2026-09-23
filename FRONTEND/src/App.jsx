import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './CONTEXT/AuthContext'; // UPCASE matching CONTEXT folder
import Login from './PAGES/Login';                 // UPCASE matching PAGES folder
import Register from './PAGES/Register';              // UPCASE matching PAGES folder
import Dashboard from './PAGES/Dashboard';            // UPCASE matching PAGES folder

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
