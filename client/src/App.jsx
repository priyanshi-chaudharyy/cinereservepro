import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AddMovie from './pages/admin/AddMovie';
import AddShowtime from './pages/admin/AddShowtime';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* User Route */}
        <Route index element={<Home />} />
        
        {/* Admin Routes */}
        <Route path="admin/add-movie" element={<AddMovie />} />
        <Route path="admin/add-showtime" element={<AddShowtime />} />
      </Route>
    </Routes>
  );
}

export default App;
