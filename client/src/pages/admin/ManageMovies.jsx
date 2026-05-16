import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { movieAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageMovies() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: movies, isLoading } = useQuery({
    queryKey: ['admin-movies', search],
    queryFn: async () => {
      const res = await movieAPI.getAll({ search: search || undefined });
      return res.data.data;
    }
  });

  const toggleFlagMutation = useMutation({
    mutationFn: async ({ id, field, value }) => {
      const res = await movieAPI.update(id, { [field]: value });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-movies']);
      toast.success('Movie updated');
    },
    onError: () => {
      toast.error('Failed to update movie');
    }
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (id) => {
      await movieAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-movies']);
      toast.success('Movie deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete movie');
    }
  });

  const handleToggle = (movie, field) => {
    toggleFlagMutation.mutate({ id: movie._id, field, value: !movie[field] });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMovieMutation.mutate(id);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Manage Movies</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Edit, delete, and categorize movies on the home page.</p>
        </div>
        <Link to="/admin/add-movie" className="btn-primary" style={{ textDecoration: 'none' }}>
          🎬 Add New Movie
        </Link>
      </div>

      <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <input
          type="text"
          className="input-base"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Movie</th>
              <th style={thStyle}>Categories</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading movies...</td></tr>
            ) : movies?.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No movies found.</td></tr>
            ) : (
              movies?.map(movie => (
                <tr key={movie._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={movie.posterUrl} alt={movie.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{movie.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{movie.director}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Badge 
                        label="Featured" 
                        active={movie.isFeatured} 
                        onClick={() => handleToggle(movie, 'isFeatured')} 
                        color="#eab308" 
                      />
                      <Badge 
                        label="Trending" 
                        active={movie.isTrending} 
                        onClick={() => handleToggle(movie, 'isTrending')} 
                        color="#ef4444" 
                      />
                      <Badge 
                        label="Coming Soon" 
                        active={movie.isComingSoon} 
                        onClick={() => handleToggle(movie, 'isComingSoon')} 
                        color="#3b82f6" 
                      />
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ 
                      fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '999px',
                      background: movie.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: movie.isActive ? '#22c55e' : '#ef4444',
                      border: `1px solid ${movie.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                    }}>
                      {movie.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <Link to={`/admin/edit-movie/${movie._id}`} style={{ 
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none', fontSize: '0.8rem', marginRight: '0.5rem'
                    }}>
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(movie._id, movie.title)} style={{ 
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontSize: '0.8rem'
                    }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '1rem', verticalAlign: 'middle' };

function Badge({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.3rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        border: `1px solid ${active ? color : 'var(--border)'}`,
        background: active ? `${color}15` : 'transparent',
        color: active ? color : 'var(--text-muted)',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}
