import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Untuk animasi modern

// SweetAlert2 & Sonner
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Pastikan sudah install: npx shadcn-ui@latest add skeleton
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight, LogOut, Users, Wallet, Loader2 } from "lucide-react";

// --- KOMPONEN LOADING SKELETON (UNIK & MODERN) ---
const DashboardSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="rounded-[24px] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
            <Skeleton className="h-5 w-16 rounded-full bg-slate-100" />
          </div>
          <Skeleton className="h-7 w-3/4 mt-4 bg-slate-100" />
          <Skeleton className="h-4 w-1/4 mt-2 bg-slate-100" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-3 w-20 mb-2 bg-slate-100" />
          <Skeleton className="h-8 w-1/2 bg-slate-100" />
        </CardContent>
        <CardFooter className="border-t border-slate-50 pt-4 flex justify-between bg-slate-50/30">
          <Skeleton className="h-4 w-24 bg-slate-100" />
          <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Loading saat pertama buka
  const [actionLoading, setActionLoading] = useState(false); // Loading untuk tombol klik
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const res = await API.get("/group/my");
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
      toast.error("Gagal sinkronisasi data");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    setActionLoading(true);
    try {
      await API.post("/group/create", { name: newGroupName });
      setOpenCreate(false);
      setNewGroupName("");
      fetchGroups();
      Swal.fire({
        title: "Berhasil!",
        text: "Grup tabungan baru telah dibuat.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat grup", { position: "top-center" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setActionLoading(true);
    try {
      await API.post("/group/join", { groupCode: groupCode });
      setOpenJoin(false);
      setGroupCode("");
      fetchGroups();
      Swal.fire({
        title: "Berhasil Join!",
        text: "Sekarang kamu sudah masuk ke grup pasanganmu.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Kode grup tidak valid", { position: "top-center" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900">
      <Toaster richColors />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-0"
          >
            <span className="text-xl"><img src="/fri.png" alt="" className="w-10"/></span>
            <span className="font-bold text-lg text-yellow-600  hidden sm:block tracking-tight">FRIN</span>
            <span className="font-bold text-lg  text-blue-600 hidden sm:block tracking-tight">TAB</span>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full shadow-sm">
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Grup Tabungan</DialogTitle>
                </DialogHeader>
                <Input 
                  placeholder="Contoh: Tabungan Kita" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)} 
                />
                <DialogFooter>
                  <Button onClick={handleCreateGroup} disabled={actionLoading} className="bg-green-600 w-full sm:w-auto">
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Buat Grup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={openJoin} onOpenChange={setOpenJoin}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full shadow-sm">
                  <Users className="w-4 h-4 mr-1" /> Join
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Gabung Grup</DialogTitle>
                </DialogHeader>
                <Input 
                  placeholder="Masukkan Kode Grup" 
                  value={groupCode} 
                  onChange={(e) => setGroupCode(e.target.value)} 
                />
                <DialogFooter>
                  <Button onClick={handleJoinGroup} disabled={actionLoading} className="bg-blue-600 w-full sm:w-auto">
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Gabung
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 rounded-full">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <motion.header 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold tracking-tight">Halo, {user?.name} 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">Kelola finansialmu hari ini.</p>
        </motion.header>

        {/* --- KONTEN UTAMA DENGAN LOADING STATE --- */}
        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DashboardSkeleton />
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {groups.map((group, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={group.id}
                >
                  <Card 
                    className="group relative rounded-[24px] border-none shadow-sm shadow-slate-200/60 hover:shadow-xl hover:ring-1 hover:ring-green-500/30 transition-all duration-500 cursor-pointer overflow-hidden bg-white"
                    onClick={() => navigate(`/transaction/${group.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-green-50 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-500">
                          {group.groupCode}
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 text-xl font-bold tracking-tight text-slate-900 group-hover:text-green-600 transition-colors">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {group.members.length} Anggota
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Total Saldo
                        </p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                          Rp {group.totalBalance.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-slate-50 pt-4 flex justify-between items-center bg-slate-50/30 group-hover:bg-green-50/50 transition-colors">
                      <span className="text-xs font-medium text-slate-500 group-hover:text-green-600 transition-colors">
                        Lihat aktivitas grup
                      </span>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isInitialLoading && groups.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-100 mt-6">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-slate-300 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Belum ada grup</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">Buat grup atau join menggunakan kode dari pasanganmu.</p>
          </div>
        )}
      </main>
    </div>
  );
}