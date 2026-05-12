import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import Home from './pages/Home';
import MovieInfo from './pages/MovieInfo';
import MovieShowtimes from './pages/MovieShowtimes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddMovie from './pages/admin/AddMovie';
import AddShowtime from './pages/admin/AddShowtime';
import BookingPage from './pages/BookingPage';
import BookingSuccess from './pages/BookingSuccess';
import BookingFailed from './pages/BookingFailed';
import MyBookings from './pages/MyBookings';
import AddTheater from './pages/admin/AddTheater';
import ManageAdmins from './pages/admin/ManageAdmins';
import TheaterList from './pages/admin/TheaterList';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminScanner from './pages/admin/AdminScanner';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="movie/:movieId" element={<MovieInfo />} />
        <Route path="movie/:movieId/showtimes" element={<MovieShowtimes />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="booking/:showtimeId" element={<BookingPage />} />
        <Route path="booking-success/:bookingId" element={<BookingSuccess />} />
        <Route path="booking-failed" element={<BookingFailed />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="scanner" element={<AdminScanner />} />
      </Route>

      {/* Admin Routes (super admin + theater admin) */}
      <Route path="/admin" element={<Layout />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="add-movie" element={<AddMovie />} />
          <Route path="add-showtime" element={<AddShowtime />} />
          <Route path="add-theater" element={<AddTheater />} />
          <Route path="manage-admins" element={<ManageAdmins />} />
          <Route path="theaters" element={<TheaterList />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
