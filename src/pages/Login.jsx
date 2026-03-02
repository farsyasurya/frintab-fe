import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Import komponen shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react'; // Tambah AlertCircle untuk icon error

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // State baru untuk error
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error setiap kali mencoba login

    try {
      const res = await API.post('/auth/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      // Ambil pesan error dari backend, jika tidak ada pakai pesan default
      const errorMessage = 'Email atau password salah!';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50 px-4">
      <div className="flex flex-col items-center mb-8 text-center">
        <span className="text-xl">
          <img src="/fri.png" alt="" className="w-20" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Masuk ke FRINTAB</h1>
        <p className="text-sm text-muted-foreground mt-1">Masukkan email Anda untuk mengakses dashboard</p>
      </div>

      <Card className="w-full max-w-[400px] border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>Kelola tabungan bersama jadi lebih mudah.</CardDescription>

          {/* PESAN ERROR DISINI */}
          {error && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600 animate-in fade-in zoom-in duration-200">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email"
                required
                className={`h-11 rounded-lg border-slate-200 focus-visible:ring-green-500 ${error ? 'border-red-300 bg-red-50/20' : ''}`}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot" className="text-xs font-medium text-green-600 hover:underline">
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="password"
                required
                className={`h-11 rounded-lg border-slate-200 focus-visible:ring-green-500 ${error ? 'border-red-300 bg-red-50/20' : ''}`}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Menghubungkan...' : 'Masuk'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground font-medium">Atau</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg">
            Masuk dengan Google
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-slate-50 pt-6">
          <p className="text-sm text-slate-500 text-center">
            Belum punya akun?{' '}
            <Link to="/register" className="text-green-600 font-bold hover:text-green-700">
              Daftar Sekarang
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="text-[11px] text-slate-400 mt-8 uppercase tracking-widest font-medium">&copy; 2026 FRINTAB.</p>
    </div>
  );
}
