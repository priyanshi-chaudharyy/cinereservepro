import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';

const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller"];

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['movies', search, selectedGenre],
    queryFn: async () => {
      const res = await api.get(`/api/movies`, {
        params: { search, genre: selectedGenre }
      });
      return res.data.data;
    }
  });

  return (
    <div className="container mx-auto p-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search by title..." 
          className="p-2 border rounded w-full md:w-1/3"
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="p-2 border rounded"
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Grid Display */}
      {isLoading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies?.map(movie => <MovieCard key={movie._id} movie={movie} />)}
        </div>
      )}
    </div>
  );
}