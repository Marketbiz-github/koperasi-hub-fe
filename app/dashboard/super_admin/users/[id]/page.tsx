'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, User, Mail, Shield, Calendar, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [userDetail, setUserDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserDetail() {
            try {
                const response = await fetch(`/api/users/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Gagal mengambil detail user');
                }

                if (data.data) {
                    setUserDetail(data.data);
                }
            } catch (err: any) {
                setError(err.message || 'Gagal mengambil detail user');
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchUserDetail();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !userDetail) {
        return (
            <div className="space-y-4 px-4">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
                    <Link href="/dashboard/super_admin/users" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar User
                    </Link>
                </Button>
                <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-600 font-medium">{error || 'User tidak ditemukan'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 pb-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent transition-none">
                        <Link href="/dashboard/super_admin/users" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar User
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Detail User</h1>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5 text-green-600" />
                            Informasi Dasar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Lengkap</span>
                                <span className="text-sm font-semibold">{userDetail.name}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{userDetail.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <Badge variant={userDetail.role === 'super_admin' ? 'default' : 'secondary'} className="capitalize">
                                        {userDetail.role}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="h-5 w-5 text-green-600" />
                            Metadata Akun
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</span>
                                <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded w-fit text-muted-foreground">#{userDetail.id}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Terdaftar Pada</span>
                                <span className="text-sm">
                                    {new Date(userDetail.created_at || Date.now()).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            {userDetail.phone && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nomor Telepon</span>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{userDetail.phone}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Plan and Flags Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {userDetail.plan && (
                    <Card className="overflow-hidden border-green-100">
                        <CardHeader className="bg-green-50/50 border-b border-green-100">
                            <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                                <Shield className="h-5 w-5" />
                                Informasi Paket
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Nama Paket</span>
                                    <Badge className="bg-green-600 hover:bg-green-700">{userDetail.plan.name}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Harga</span>
                                    <span className="font-semibold">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(userDetail.plan.price)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Durasi</span>
                                    <span>{userDetail.plan.duration_days} Hari</span>
                                </div>
                                {userDetail.expired_at && (
                                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                                        <span className="text-muted-foreground">Masa Aktif Hingga</span>
                                        <span className="font-medium text-orange-600">
                                            {new Date(userDetail.expired_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {userDetail.flags && userDetail.flags.length > 0 && (
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Flags / Label User</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2">
                                {userDetail.flags.map((flag: any) => (
                                    <Badge key={flag.id} variant="outline" className="px-3 py-1">
                                        {flag.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Child Affiliations Section */}
            {userDetail.child_affiliations && userDetail.child_affiliations.length > 0 && (
                <Card className="overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg">Afiliasi Anak</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {userDetail.child_affiliations.map((aff: any) => (
                                <div key={aff.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="size-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{aff.user?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-muted-foreground">{aff.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="capitalize text-[10px]">{aff.type}</Badge>
                                        <p className="text-[10px] text-muted-foreground mt-1">ID: #{aff.user?.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {!userDetail.plan && !userDetail.flags?.length && !userDetail.child_affiliations?.length && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {userDetail.role === 'vendor' ? 'User ini terdaftar sebagai Vendor.' :
                                userDetail.role === 'super_admin' ? 'User ini memiliki hak akses Super Admin.' :
                                    'User ini terdaftar dengan role ' + userDetail.role + '.'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
