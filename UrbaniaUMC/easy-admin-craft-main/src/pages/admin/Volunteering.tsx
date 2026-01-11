import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { volunteerService, Volunteer } from '@/services/volunteer.service';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, List, Grid } from 'lucide-react';
import { format } from 'date-fns';

const Volunteering = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'applicationDate' | 'fullName' | 'status'>('applicationDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const [groupByRole, setGroupByRole] = useState(false);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getAllVolunteers();
      setVolunteers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch volunteers');
      toast.error('Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return 'PENDING';
    return status.toUpperCase();
  };

  // Unique roles and availabilities for filters
  const allRoles = Array.from(new Set(volunteers.map(v => v.role))).filter(Boolean);
  const allAvailabilities = Array.from(new Set(volunteers.map(v => v.availability))).filter(Boolean);

  // Filtering
  let filtered = volunteers.filter(v => {
    const matchesStatus = activeTab === 'all' ? true : v.status?.toLowerCase() === activeTab;
    const matchesRole = roleFilter === 'all' ? true : v.role === roleFilter;
    const matchesAvailability = availabilityFilter === 'all' ? true : v.availability === availabilityFilter;
    const matchesSearch =
      v.fullName.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesRole && matchesAvailability && matchesSearch;
  });

  // Sorting
  filtered = filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === 'applicationDate') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Bulk actions
  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      return newSet;
    });
  };
  const selectAll = () => setSelectedRows(new Set(paginated.map(v => v._id)));
  const clearAll = () => setSelectedRows(new Set());
  const bulkApprove = async () => {
    for (const id of selectedRows) await volunteerService.approveVolunteer(id);
    toast.success('Selected applications approved');
    fetchVolunteers();
    clearAll();
  };
  const bulkReject = async () => {
    for (const id of selectedRows) await volunteerService.rejectVolunteer(id);
    toast.success('Selected applications rejected');
    fetchVolunteers();
    clearAll();
  };
  // Export to CSV
  const exportCSV = () => {
    const rows = [
      ['Full Name', 'Email', 'Phone', 'Role', 'Availability', 'Status', 'Application Date'],
      ...filtered.map(v => [v.fullName, v.email, v.phone, v.role, v.availability, v.status, v.applicationDate])
    ];
    const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render volunteer card component
  const renderVolunteerCard = (volunteer: Volunteer) => (
    <Card key={volunteer._id} className={selectedRows.has(volunteer._id) ? 'ring-2 ring-primary' : 'hover:shadow-lg transition-shadow'}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{volunteer.fullName}</CardTitle>
          <Badge className={getStatusColor(volunteer.status)}>
            {getStatusText(volunteer.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Contact</p>
            <p className="font-medium">{volunteer.email}</p>
            <p className="font-medium">{volunteer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{volunteer.role}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Availability</p>
            <p className="font-medium">{volunteer.availability}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Application Date</p>
            <p className="font-medium">{format(new Date(volunteer.applicationDate), 'yyyy-MM-dd')}</p>
          </div>
          {volunteer.skills && volunteer.skills.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {volunteer.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {!groupByRole && (
              <input 
                type="checkbox" 
                checked={selectedRows.has(volunteer._id)} 
                onChange={() => toggleRow(volunteer._id)}
                className="mt-2"
              />
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/admin/volunteering/${volunteer._id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render table row component
  const renderTableRow = (volunteer: Volunteer) => (
    <TableRow key={volunteer._id} className={selectedRows.has(volunteer._id) ? 'bg-primary/10' : ''}>
      {!groupByRole && (
        <TableCell>
          <input 
            type="checkbox" 
            checked={selectedRows.has(volunteer._id)} 
            onChange={() => toggleRow(volunteer._id)} 
          />
        </TableCell>
      )}
      <TableCell>{volunteer.fullName}</TableCell>
      <TableCell>{volunteer.email}</TableCell>
      <TableCell>{volunteer.phone}</TableCell>
      <TableCell>{volunteer.role}</TableCell>
      <TableCell>{volunteer.availability}</TableCell>
      <TableCell>
        <Badge className={getStatusColor(volunteer.status)}>
          {getStatusText(volunteer.status)}
        </Badge>
      </TableCell>
      <TableCell>{format(new Date(volunteer.applicationDate), 'yyyy-MM-dd')}</TableCell>
      <TableCell>
        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/volunteering/${volunteer._id}`)}>
          View
        </Button>
      </TableCell>
    </TableRow>
  );

  if (loading) return <div>Loading volunteers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap gap-4 items-center mb-6 justify-between">
        <h1 className="text-2xl font-bold">Volunteer Applications</h1>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={fetchVolunteers} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />Refresh
          </Button>
          <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />Export CSV
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />Grid
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />List
          </Button>
          <Button 
            variant={groupByRole ? 'default' : 'outline'} 
            onClick={() => setGroupByRole(g => !g)}
          >
            Group by Role
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <Input 
          placeholder="Search name, email, phone..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-64" 
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Role: {roleFilter === 'all' ? 'All' : roleFilter}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setRoleFilter('all')}>All</DropdownMenuItem>
            {allRoles.map(role => (
              <DropdownMenuItem key={role} onClick={() => setRoleFilter(role)}>
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Availability: {availabilityFilter === 'all' ? 'All' : availabilityFilter}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setAvailabilityFilter('all')}>All</DropdownMenuItem>
            {allAvailabilities.map(avail => (
              <DropdownMenuItem key={avail} onClick={() => setAvailabilityFilter(avail)}>
                {avail}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Sort: {sortBy} {sortDir === 'asc' ? '↑' : '↓'}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('applicationDate')}>Application Date</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('fullName')}>Name</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
              {sortDir === 'asc' ? 'Descending' : 'Ascending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedRows.size > 0 && !groupByRole && (
        <div className="flex gap-2 mb-4">
          <Button size="sm" onClick={bulkApprove} className="bg-green-600 hover:bg-green-700">
            Approve Selected ({selectedRows.size})
          </Button>
          <Button size="sm" onClick={bulkReject} variant="destructive">
            Reject Selected ({selectedRows.size})
          </Button>
          <Button size="sm" variant="outline" onClick={clearAll}>
            Clear Selection
          </Button>
        </div>
      )}
      
      {groupByRole ? (
        // Grouped by role view
        allRoles.map(role => {
          const roleVolunteers = paginated.filter(v => v.role === role);
          if (roleVolunteers.length === 0) return null;
          
          return (
            <div key={role} className="mb-10">
              <h2 className="text-xl font-semibold mb-4">{role} ({roleVolunteers.length})</h2>
              {viewMode === 'list' ? (
                <div className="overflow-x-auto rounded-lg border mb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleVolunteers.map(renderTableRow)}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {roleVolunteers.map(renderVolunteerCard)}
                </div>
              )}
            </div>
          );
        })
      ) : (
        // Non-grouped view
        viewMode === 'list' ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input 
                      type="checkbox" 
                      checked={paginated.length > 0 && paginated.every(v => selectedRows.has(v._id))} 
                      onChange={e => e.target.checked ? selectAll() : clearAll()} 
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(renderTableRow)}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(renderVolunteerCard)}
          </div>
        )
      )}
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-muted-foreground">
          Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} volunteers
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 py-2 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {activeTab === 'all'
              ? 'No volunteer applications found'
              : `No ${activeTab} volunteer applications found`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Volunteering; 