import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { movieAPI } from '../../services/api';
import toast from 'react-hot-toast';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Adventure'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali'];
const FORMATS = ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'];

export default function EditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', duration: '', releasedDate: '', certification: '',
    director: '', trailerUrl: '', genre: [], language: [], format: [],
    cast: [], crew: []
  });

  const { data: movie, isLoading: isFetching } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const res = await movieAPI.getById(id);
      return res.data.data;
    }
  });

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        duration: movie.duration || '',
        releasedDate: movie.releasedDate ? new Date(movie.releasedDate).toISOString().split('T')[0] : '',
        certification: movie.certification || '',
        director: movie.director || '',
        trailerUrl: movie.trailerUrl || '',
        genre: movie.genre || [],
        language: movie.language || [],
        format: movie.format || [],
        cast: movie.cast || [],
        crew: movie.crew || []
      });
      setPreview(movie.posterUrl);
    }
  }, [movie]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const updateCast = (index, field, value) => {
    setFormData(p => {
      const cast = [...p.cast];
      cast[index] = { ...cast[index], [field]: value };
      return { ...p, cast };
    });
  };

  const updateCrew = (index, field, value) => {
    setFormData(p => {
      const crew = [...p.crew];
      crew[index] = { ...crew[index], [field]: value };
      return { ...p, crew };
    });
  };

  const addCastMember = () => setFormData(p => ({ ...p, cast: [...p.cast, { name: '', role: '', imageUrl: '' }] }));
  const addCrewMember = () => setFormData(p => ({ ...p, crew: [...p.crew, { name: '', role: '', imageUrl: '' }] }));
  const removeCastMember = (index) => setFormData(p => ({ ...p, cast: p.cast.filter((_, i) => i !== index) }));
  const removeCrewMember = (index) => setFormData(p => ({ ...p, crew: p.crew.filter((_, i) => i !== index) }));

  const toggleArray = (field, value) => {
    setFormData(p => ({
      ...p,
      [field]: p[field].includes(value) ? p[field].filter(v => v !== value) : [...p[field], value],
    }));
  };

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.genre.length === 0) { toast.error('Select at least one genre'); return; }

    setLoading(true);
    try {
      let posterUrl = movie.posterUrl;
      let posterPublicId = movie.posterPublicId;

      // Upload new image if selected
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        const imgRes = await api.post('/api/upload/image', fd);
        posterUrl = imgRes.data.data.url;
        posterPublicId = imgRes.data.data.publicId;
      }

      const cleanCast = (formData.cast || []).filter(m => m.name && m.name.trim().length > 0);
      const cleanCrew = (formData.crew || []).filter(m => m.name && m.name.trim().length > 0);

      await movieAPI.update(id, {
        ...formData,
        cast: cleanCast,
        crew: cleanCrew,
        duration: Number(formData.duration),
        posterUrl,
        posterPublicId,
      });

      toast.success('Movie updated successfully! 🎬');
      navigate('/admin/manage-movies');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update movie');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) return <div style={{ padding: '2rem' }}>Loading movie data...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '860px' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Edit Movie</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update details for {movie?.title}.</p>
        </div>
        <button onClick={() => navigate('/admin/manage-movies')} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Poster Upload */}
          <div>
            <label style={labelStyle}>Poster Image *</label>
            <label htmlFor="poster-upload" style={{
              display: 'block', aspectRatio: '2/3', background: 'var(--bg-elevated)', border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>🖼</span>
                  <span style={{ fontSize: '0.8rem', textAlign: 'center', padding: '0 0.5rem' }}>Click to upload poster</span>
                </div>
              )}
            </label>
            <input id="poster-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Title *" name="title" placeholder="e.g. Interstellar" value={formData.title} onChange={handleChange} required />
            <Field label="Director" name="director" placeholder="e.g. Christopher Nolan" value={formData.director} onChange={handleChange} />

            <Field label="Certification" name="certification" placeholder="e.g. UA16+" value={formData.certification} onChange={handleChange} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Duration (minutes) *" name="duration" type="number" placeholder="e.g. 169" value={formData.duration} onChange={handleChange} required />
              <Field label="Release Date *" name="releasedDate" type="date" value={formData.releasedDate} onChange={handleChange} required />
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea name="description" className="input-base" placeholder="Brief plot summary..." value={formData.description} onChange={handleChange} required rows={3} style={{ resize: 'vertical' }} />
            </div>

            <Field label="Trailer URL (YouTube)" name="trailerUrl" placeholder="https://youtube.com/watch?v=..." value={formData.trailerUrl} onChange={handleChange} />

            {/* Cast */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Cast</label>
                <button type="button" onClick={addCastMember} style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem',
                  border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)'
                }}>
                  + Add Cast
                </button>
              </div>
              {formData.cast.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No cast added yet.</p>
              )}
              {formData.cast.map((member, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <input className="input-base" placeholder="Actor name" value={member.name} onChange={e => updateCast(index, 'name', e.target.value)} />
                  <input className="input-base" placeholder="Role" value={member.role} onChange={e => updateCast(index, 'role', e.target.value)} />
                  <input className="input-base" placeholder="Image URL" value={member.imageUrl} onChange={e => updateCast(index, 'imageUrl', e.target.value)} />
                  <button type="button" onClick={() => removeCastMember(index)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
            </div>

            {/* Crew */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Crew</label>
                <button type="button" onClick={addCrewMember} style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem',
                  border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)'
                }}>
                  + Add Crew
                </button>
              </div>
              {formData.crew.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No crew added yet.</p>
              )}
              {formData.crew.map((member, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <input className="input-base" placeholder="Crew name" value={member.name} onChange={e => updateCrew(index, 'name', e.target.value)} />
                  <input className="input-base" placeholder="Role" value={member.role} onChange={e => updateCrew(index, 'role', e.target.value)} />
                  <input className="input-base" placeholder="Image URL" value={member.imageUrl} onChange={e => updateCrew(index, 'imageUrl', e.target.value)} />
                  <button type="button" onClick={() => removeCrewMember(index)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
            </div>

            {/* Genre Chips */}
            <div>
              <label style={labelStyle}>Genre * (select multiple)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {GENRES.map(g => {
                  const active = formData.genre.includes(g);
                  return (
                    <button type="button" key={g} onClick={() => toggleArray('genre', g)} style={{
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'var(--font-main)', cursor: 'pointer', transition: 'all 0.15s',
                      background: active ? 'rgba(229,9,20,0.2)' : 'transparent', border: active ? '1px solid var(--red)' : '1px solid var(--border)',
                      color: active ? '#fff' : 'var(--text-secondary)', fontWeight: active ? 600 : 400,
                    }}>{g}</button>
                  );
                })}
              </div>
            </div>

            {/* Language Chips */}
            <div>
              <label style={labelStyle}>Language</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {LANGUAGES.map(l => {
                  const active = formData.language.includes(l);
                  return (
                    <button type="button" key={l} onClick={() => toggleArray('language', l)} style={{
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'var(--font-main)', cursor: 'pointer', transition: 'all 0.15s',
                      background: active ? 'rgba(245,197,24,0.12)' : 'transparent', border: active ? '1px solid rgba(245,197,24,0.4)' : '1px solid var(--border)',
                      color: active ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400,
                    }}>{l}</button>
                  );
                })}
              </div>
            </div>

            {/* Format Chips */}
            <div>
              <label style={labelStyle}>Format</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {FORMATS.map(f => {
                  const active = formData.format.includes(f);
                  return (
                    <button type="button" key={f} onClick={() => toggleArray('format', f)} style={{
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'var(--font-main)', cursor: 'pointer', transition: 'all 0.15s',
                      background: active ? 'rgba(96,165,250,0.15)' : 'transparent', border: active ? '1px solid rgba(96,165,250,0.5)' : '1px solid var(--border)',
                      color: active ? '#60a5fa' : 'var(--text-secondary)', fontWeight: active ? 600 : 400,
                    }}>{f}</button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? '⏳ Updating...' : '🎬 Update Movie'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };

function Field({ label, name, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        className="input-base"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}
