import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AddShowtime() {
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('');

  useEffect(() => {
    api.get('/api/theaters').then(res => setTheaters(res.data.data));
  }, []);

  const handleTheaterChange = (e) => {
    const theaterId = e.target.value;
    setSelectedTheater(theaterId);
    const theater = theaters.find(t => t._id === theaterId);
    setScreens(theater ? theater.screens : []);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Schedule Showtime</h2>
      <select onChange={handleTheaterChange} className="w-full p-2 mb-3 border">
        <option>Select Theater</option>
        {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
      </select>
      <select className="w-full p-2 mb-3 border">
        <option>Select Screen</option>
        {screens.map(s => <option key={s._id} value={s._id}>{s.screenName}</option>)}
      </select>
      {/* Date, Time, and Pricing inputs */}
      <button className="bg-green-600 text-white w-full py-2">Add Showtime</button>
    </div>
  );
}