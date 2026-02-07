'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function UserListPage() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Gagal mengambil data user');
                }

                if (data.data) {
                    setUsers(data.data);
                }
            } catch (err: any) {
                setError(err.message || 'Gagal mengambil data user');
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsers();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Kelola User</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar User</CardTitle>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                            {error}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Tidak ada data user.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium text-muted-foreground">#{user.id}</TableCell>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'} className="capitalize">
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/dashboard/super_admin/users/${user.id}`}>Detail</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
