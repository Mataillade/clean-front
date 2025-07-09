import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { ScrollToTop } from './components/common/ScrollToTop';
import AppLayout from './layout/AppLayout';

function App() {
  return (
      <>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </>
  );
}

export default App;