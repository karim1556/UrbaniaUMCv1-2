import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, HandHelping, FileText, Image, Video, TrendingUp, ArrowUpRight, ArrowDownRight, X, Mail, Phone, MapPin, Building, Search, Filter, MoreVertical, GraduationCap, Clock, Users2, BookOpenCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { volunteerService } from '@/services/volunteer.service';
import { eventService } from '@/services/event.service';

const UserManagementCard = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch recent users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: async () => {
      const allUsers = await userService.getAllUsers();
      // Sort by creation date and take the 10 most recent
      return allUsers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="card-hover group bg-white">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-hover group bg-white">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading users. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover group bg-white">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-[200px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users?.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="outline" className={getRoleColor(role)}>
                        {role}
                      </Badge>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={getStatusColor('active')}>
                      Active
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/users/${user._id}`} onClick={(e) => e.stopPropagation()}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* TODO: navigate to edit */ }}>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={async (e) => {
                          e.stopPropagation();
                          const ok = window.confirm(`Delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`);
                          if (!ok) return;
                          try {
                            await userService.deleteUser(user._id);
                            // simple reload of recentUsers query by invalidating cache
                            // Since this component uses useQuery with key ['recentUsers'], we can force refetch by reloading window or using queryClient.
                            window.location.reload();
                          } catch (err) {
                            console.error('Failed to delete user', err);
                            alert('Failed to delete user');
                          }
                        }}>Delete User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col space-y-4 py-4">
              <div className="flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Users className="h-10 w-10" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-gray-600">{selectedUser.mobile}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-primary" />
                    <span className="text-sm font-medium">Join Date</span>
                  </div>
                  {(() => {
                    const created = selectedUser.createdAt ? new Date(selectedUser.createdAt) : null;
                    const label = created && !isNaN(created.getTime()) ? format(created, 'MMM d, yyyy') : 'Unknown';
                    return <span className="font-semibold">{label}</span>;
                  })()}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    {selectedUser.roles.map((role: string) => (
                      <Badge key={role} variant="outline" className={`mr-3 ${getRoleColor(role)}`}>
                        {role}
                      </Badge>
                    ))}
                    <Badge variant="outline" className={getStatusColor('active')}>
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Dashboard = () => {
  // Fetch total users dynamically (keep using useQuery for users)
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
    staleTime: 60000,
  });
  const totalUsers = users?.length || 0;

  // Volunteers count using useEffect/useState
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  useEffect(() => {
    const fetchVolunteers = async () => {
      setVolunteersLoading(true);
      try {
        const data = await volunteerService.getAllVolunteers();
        setVolunteers(Array.isArray(data) ? data : []);
      } catch {
        setVolunteers([]);
      } finally {
        setVolunteersLoading(false);
      }
    };
    fetchVolunteers();
  }, []);
  const totalVolunteers = volunteers.length;

  // Total events count using useEffect/useState
  const [totalEvents, setTotalEvents] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(true);
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const data = await eventService.getAllEvents(1, 100);
        // data may be an array or an object with events property
        const eventsArr = Array.isArray(data) ? data : data?.events || [];
        setTotalEvents(eventsArr.length);
      } catch {
        setTotalEvents(0);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-8 bg-gray-50 p-6">
      <div className="flex flex-col">
        <h2 className="text-4xl font-bold tracking-tight animate-slide-in bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-gray-600 animate-slide-in text-lg" style={{ animationDelay: "50ms" }}>
          Welcome to your admin dashboard. Here's an overview of your site's activity.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-slide-in" style={{ animationDelay: "100ms" }}>
        <Card className="card-hover group bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg mb-2">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Total Users</p>
          </CardContent>
        </Card>
        <Card className="card-hover group bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg mb-2">
              <HandHelping className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">{volunteersLoading ? '...' : totalVolunteers}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Total Volunteers</p>
          </CardContent>
        </Card>
        <Card className="card-hover group bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg mb-2">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">{eventsLoading ? '...' : totalEvents}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Total Events</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 animate-slide-in" style={{ animationDelay: "150ms" }}>
        <div className="col-span-2 w-full">
          <UserManagementCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
