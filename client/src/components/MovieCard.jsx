export default function MovieCard({ movie }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transition-transform">
      <img src={movie.posterUrl} alt={movie.title} className="w-full h-72 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{movie.title}</h3>
        <div className="flex gap-2 mt-2 flex-wrap">
          {movie.genre.map(g => (
            <span key={g} className="text-xs bg-gray-200 px-2 py-1 rounded">{g}</span>
          ))}
        </div>
        <p className="text-yellow-600 font-bold mt-2">⭐ {movie.rating}/10</p>
      </div>
    </div>
  );
}