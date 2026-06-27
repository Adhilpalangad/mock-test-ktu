import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Dashboard   from './pages/Dashboard';
import Disclaimer  from './pages/Disclaimer';
import Exam        from './pages/Exam';
import Result      from './pages/Result';
import History     from './pages/History';
import QuestionBank from './pages/QuestionBank';
import Feedback    from './pages/Feedback';
import AdminUsers  from './pages/AdminUsers';

const Private = ({ children }) => { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace />; };
const Guest   = ({ children }) => { const { user } = useAuth(); return !user ? children : <Navigate to="/dashboard" replace />; };
const Admin   = ({ children }) => { const { user } = useAuth(); return user && user.role === 'admin' ? children : <Navigate to="/dashboard" replace />; };

function Routes_() {
  return (
    <Routes>
      <Route path="/"                        element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"                   element={<Guest><Login /></Guest>} />
      <Route path="/signup"                  element={<Guest><Signup /></Guest>} />
      <Route path="/dashboard"               element={<Private><Dashboard /></Private>} />
      <Route path="/disclaimer/:testId"      element={<Private><Disclaimer /></Private>} />
      <Route path="/exam/:attemptId"         element={<Private><Exam /></Private>} />
      <Route path="/result/:attemptId"       element={<Private><Result /></Private>} />
      <Route path="/history"                 element={<Private><History /></Private>} />
      <Route path="/question-bank"           element={<Private><QuestionBank /></Private>} />
      <Route path="/feedback"                element={<Private><Feedback /></Private>} />
      <Route path="/admin/users"             element={<Admin><AdminUsers /></Admin>} />
      <Route path="*"                        element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes_ />
      </BrowserRouter>
    </AuthProvider>
  );
}
