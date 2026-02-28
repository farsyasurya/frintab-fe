import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

// Shadcn UI & Icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {} from 'lucide-react';
import { ArrowLeft, Wallet, MoreVertical, UserPlus, Settings, ArrowUpRight, ArrowDownCircle, Plus, Copy, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [info, setInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalTransactions: 0,
  });

  const fetchDetail = async (currentPage = 1) => {
    try {
      // Tambahkan query params ?page=...
      const res = await API.get(`/transaction/${id}?page=${currentPage}&limit=5`);
      setGroup(res.data);
      setTransactions(res.data.transactions);

      // Simpan info pagination dari response API
      setPagination({
        totalPages: res.data.totalPages,
        totalTransactions: res.data.totalTransactions,
      });
    } catch (err) {
      toast.error('Gagal memuat data grup');
    }
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await API.get(`/group/${id}`);
        setInfo(res.data);
      } catch (err) {
        console.error('Gagal memuat info grup', err);
      }
    };

    const load = async () => {
      setLoading(true);
      await fetchDetail(page); // Masukkan state page ke sini
      await fetchInfo();
      setLoading(false);
    };

    load();
  }, [id, page]); // Tambahkan 'page' ke dependency array agar refresh saat ganti halaman

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await API.get(`/group/${id}`);
        setInfo(res.data);
      } catch (err) {
        console.error('Gagal memuat info grup', err);
      }
    };

    const load = async () => {
      setLoading(true);
      await fetchDetail();
      await fetchInfo();
      setLoading(false);
    };

    load();
  }, [id]);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositForm, setDepositForm] = useState({
    amount: '',
    note: '',
    type: '',
  });
  const [saving, setSaving] = useState(false);
  const handleSaveTransaction = async () => {
    if (!depositForm.amount) return toast.error('Nominal harus diisi');

    setSaving(true);
    try {
      await API.post('/transaction', {
        groupId: id,
        amount: Number(depositForm.amount),
        type: depositForm.type,
        note: depositForm.note || '-',
      });

      setPage(1); // Kembali ke halaman 1 untuk melihat transaksi terbaru
      await fetchDetail(1); // Fetch ulang halaman 1

      setIsDepositOpen(false);
      setDepositForm({ amount: '', note: '', type: '' });

      Swal.fire({
        title: 'Berhasil!',
        text: 'Tabunganmu sudah tercatat.',
        icon: 'success',
        confirmButtonColor: '#16a34a',
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat transaksi';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Kode grup berhasil disalin!', { position: 'top-center' });
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-400">Memuat detail...</div>;

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-12">
      {/* 1. Header yang Responsif & Sticky */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-600 px-2 sm:px-4">
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Kembali</span>
          </Button>

          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">
              {info?.groupCode}
            </Badge>
            <Button size="icon" variant="ghost" onClick={() => copyCode(info?.groupCode)} className="h-8 w-8 text-slate-400">
              <Copy className="w-3.5 h-3.5" />
            </Button>

            {/* Menu Dropdown untuk Desktop/Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full ml-1">
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                <DropdownMenuItem onClick={() => {}} className="text-sm">
                  <UserPlus className="w-4 h-4 mr-2" /> Tambah Anggota
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}} className="text-sm">
                  <Settings className="w-4 h-4 mr-2" /> Pengaturan Grup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-6 sm:mt-10 space-y-6 sm:space-y-8">
        {/* 2. Main Title (Tampil di atas card) */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{info?.name}</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Kelola finansial bersama lebih transparan.</p>
        </header>

        {/* 3. Bento Grid: Saldo & Info Anggota */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Card Saldo Utama */}
          <Card className="rounded-[20px] sm:rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/50 bg-white">
            <CardContent className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Total Saldo Bersama</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-none">
                  Rp {group?.totalBalance?.toLocaleString('id-ID')}
                </h2>
              </div>

              {/* Tombol yang diperkecil & responsif */}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5">
                {/* Gunakan Dialog dari shadcn/ui */}
                <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                  <DialogTrigger asChild>
                    {/* Gunakan Dialog dari shadcn/ui */}
                    <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 rounded-lg px-4 h-10 text-xs sm:text-sm font-semibold flex-1 sm:flex-initial">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Nabung
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[425px] rounded-[24px]">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Catat Tabungan</DialogTitle>
                          <DialogDescription>Masukkan jumlah uang yang ingin kamu tabung di grup ini.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-4">
                          {/* Field 1: Tipe Transaksi */}
                          <div className="grid gap-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Tipe Transaksi</label>
                            <Select value={depositForm.type} onValueChange={(value) => setDepositForm({ ...depositForm, type: value })}>
                              <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-green-500/20">
                                <SelectValue placeholder="Pilih tipe" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="INCOME" className="text-green-600 font-medium">
                                  Pemasukan (Income)
                                </SelectItem>
                                <SelectItem value="EXPENSE" className="text-red-600 font-medium">
                                  Pengeluaran (Expense)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Field 2: Nominal */}
                          <div className="grid gap-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nominal (Rp)</label>
                            <Input
                              type="number"
                              placeholder="Masukkan jumlah uang"
                              value={depositForm.amount}
                              onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                              className="rounded-xl border-slate-200 h-11 focus:ring-green-500/20 focus:border-green-500"
                            />
                          </div>

                          {/* Field 3: Keterangan */}
                          <div className="grid gap-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Keterangan</label>
                            <Input
                              placeholder="Contoh: Gaji, Uang Makan, dll"
                              value={depositForm.note}
                              onChange={(e) => setDepositForm({ ...depositForm, note: e.target.value })}
                              className="rounded-xl border-slate-200 h-11 focus:ring-green-500/20 focus:border-green-500"
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={handleSaveTransaction}
                            disabled={saving}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-green-100"
                          >
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {saving ? 'Menyimpan...' : 'Simpan Tabungan'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px] rounded-[24px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Catat Tabungan</DialogTitle>
                      <DialogDescription>Masukkan jumlah uang yang ingin kamu tabung di grup ini.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                      {/* Field 1: Tipe Transaksi */}
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Tipe Transaksi</label>
                        <Select value={depositForm.type} onValueChange={(value) => setDepositForm({ ...depositForm, type: value })}>
                          <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-green-500/20">
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="INCOME" className="text-green-600 font-medium">
                              Pemasukan (Income)
                            </SelectItem>
                            <SelectItem value="EXPENSE" className="text-red-600 font-medium">
                              Pengeluaran (Expense)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Field 2: Nominal */}
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nominal (Rp)</label>
                        <Input
                          type="number"
                          placeholder="Masukkan jumlah uang"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                          className="rounded-xl border-slate-200 h-11 focus:ring-green-500/20 focus:border-green-500"
                        />
                      </div>

                      {/* Field 3: Keterangan */}
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Keterangan</label>
                        <Input
                          placeholder="Contoh: Gaji, Uang Makan, dll"
                          value={depositForm.note}
                          onChange={(e) => setDepositForm({ ...depositForm, note: e.target.value })}
                          className="rounded-xl border-slate-200 h-11 focus:ring-green-500/20 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleSaveTransaction}
                        disabled={saving}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-green-100"
                      >
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {saving ? 'Menyimpan...' : 'Simpan Tabungan'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="rounded-lg border-slate-200 px-4 h-10 text-xs sm:text-sm font-medium text-slate-600">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Info Anggota */}
          <Card className="rounded-[20px] sm:rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/50 bg-white">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg sm:text-xl font-bold">Anggota Grup</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex flex-wrap gap-2">
                {info.members?.map((member) => (
                  <Badge key={member.email} variant="secondary" className="rounded-full px-3 py-1 bg-slate-100 text-slate-700 text-[11px] sm:text-xs">
                    {member.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Riwayat Transaksi */}
        <Card className="rounded-[24px] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-bold text-slate-900">Riwayat Transaksi</CardTitle>
            <CardDescription className="text-sm text-slate-500">Total {pagination.totalTransactions} transaksi ditemukan</CardDescription>
          </CardHeader>

          <CardContent className="p-2 sm:p-4">
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-2">
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 rounded-[18px] hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                      {/* ... (Konten list item sama seperti sebelumnya) ... */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                            t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {t.type === 'INCOME' ? <ArrowDownCircle className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-[15px]">{t.note}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(t.createdAt).toLocaleDateString('id-ID')} • {t.name || t.userName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-[16px] ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                          {t.type === 'INCOME' ? '+' : '-'} {t.amount?.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400">Belum ada transaksi</div>
                )}
              </div>
            </ScrollArea>

            {/* --- NAVIGASI PAGINATION --- */}
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 px-2 pt-4 border-t border-slate-50">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Halaman {page} dari {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 text-xs font-bold border-slate-200"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 text-xs font-bold border-slate-200"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
