'use client';

import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ActivationSuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900">
            {/* Logo Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
            >
                <div className="relative w-48 h-12">
                    <Image
                        src="/images/koperasihub2.png"
                        alt="KoperasiHub Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-emerald-500/5 border border-slate-100 p-8 md:p-12 text-center relative overflow-hidden"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mb-16 opacity-50 blur-3xl"></div>

                <div className="relative z-10">
                    {/* Success Icon Animation */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2 
                        }}
                        className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
                    >
                        <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4"
                    >
                        Email Berhasil <br/><span className="text-emerald-600">Terverifikasi!</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-slate-500 font-medium leading-relaxed mb-10 px-4"
                    >
                        Terima kasih telah melakukan aktivasi. Akun Anda sekarang telah aktif dan Anda dapat mulai menggunakan layanan kami.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-4"
                    >
                        <Link 
                            href="/login" 
                            className="group flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/25 active:scale-95 text-lg"
                        >
                            Masuk Sekarang
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <Link 
                            href="/" 
                            className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-semibold py-2 transition-colors text-sm"
                        >
                            <Home className="w-4 h-4" />
                            Kembali ke Beranda
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-sm text-slate-400 font-medium"
            >
                &copy; {new Date().getFullYear()} KoperasiHub Platform. Seluruh Hak Cipta Dilindungi.
            </motion.p>
        </div>
    );
}
