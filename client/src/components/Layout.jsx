import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-500">CINERESERVE</Link>
          <div className="space-x-6">
            <Link to="/" className="hover:text-red-400">Home</Link>
            <Link to="/admin/add-movie" className="hover:text-red-400 font-semibold border-l pl-6 border-gray-600">Admin Panel</Link>
          </div>
        </div>
      </nav>
      
      <main className="py-8">
        <Outlet /> 
      </main>
    </div>
  );
}