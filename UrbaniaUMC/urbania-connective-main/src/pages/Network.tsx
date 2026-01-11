import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/authContext';
import { userAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

const PAGE_SIZE = 10;

const Network = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getAllUsers();
        const list = res.data?.data || res.data || [];
        if (!mounted) return;
        // Remove admin accounts if any (defense in depth)
        const filtered = Array.isArray(list) ? list.filter((u:any) => !(u.roles && Array.isArray(u.roles) && u.roles.includes('admin'))) : [];
        setUsers(filtered);
      } catch (err) {
        console.error('Error loading network:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [user?._id]);

  const filtered = users.filter(u => {
    if (!query) return true;
    const q = query.toLowerCase();
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return name.includes(q) || (u.mobile || '').toString().includes(q) || (u.phone || '').toString().includes(q) || (u.occupationProfile || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Network Directory</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Search and browse users on the Urbania system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input placeholder="Search by name, phone, occupation" value={query} onChange={(e)=>setQuery(e.target.value)} />
              <Button onClick={()=>{ setQuery(''); setPage(1); }}>Clear</Button>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase bg-muted/50">
                      <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2">Occupation</th>
                        <th className="px-4 py-2">Building</th>
                        <th className="px-4 py-2">Flat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map(u => (
                        <tr key={u._id || u.id} className="border-b">
                          <td className="px-4 py-3">{(u.firstName || '') + (u.lastName ? ' ' + u.lastName : '') || u.name || '—'}</td>
                          <td className="px-4 py-3">{u.mobile || u.phone || '—'}</td>
                          <td className="px-4 py-3">{u.occupationProfile || u.occupationType || u.occupationDescription || '—'}</td>
                          <td className="px-4 py-3">{u.buildingName || '—'}</td>
                          <td className="px-4 py-3">{u.flatNo || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">Showing {(page-1)*PAGE_SIZE + 1} - {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</Button>
                    <div className="text-sm">Page {page} / {totalPages}</div>
                    <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Next</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Network;
