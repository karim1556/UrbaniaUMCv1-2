import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock,
  Folder,
  Gift,
  Heart,
  Mail,
  Settings,
  UserRound,
  CheckCircle2,
  Bookmark,
  BookOpen,
  MapPin
} from "lucide-react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { donationAPI, volunteerAPI, registrationAPI, courseRegistrationAPI, userAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EventRegistrationDetails from "@/components/events/EventRegistrationDetails";

type Donation = {
  _id: string;
  donor: string;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  currency: string;
  program: string;
  donationType: string;
  status: string;
  date: string;
  paymentDetails: {
    status: string;
    method: string;
    transactionId?: string;
  };
  createdAt: string;
  anonymous?: boolean;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  message?: string;
};

type Volunteer = {
  _id: string;
  volunteerId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  experience: string;
  availability: string;
  motivation: string;
  status: string;
  applicationDate: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
};

type CourseRegistration = {
  _id: string;
  courseTitle: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  level: string;
};

type EventRegistration = {
  _id: string;
  eventName: string;
  eventDate: string;
  event?: {
    _id: string;
    title: string;
    time?: {
      startTime: string;
      endTime: string;
    };
    location: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  checkedIn: boolean;
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'Approved':
      return 'default'; // Typically green or primary color
    case 'Rejected':
      return 'destructive';
    case 'Pending':
      return 'secondary';
    default:
      return 'outline';
  }
};

const Dashboard = () => {
  const { user, getInitials, refreshUserProfile } = useAuth();
  const displayUser = user;
  const location = useLocation();
  // Read tab from query string
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [networkUsers, setNetworkUsers] = useState<any[]>([]);
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<CourseRegistration[]>([]);
  const [myEventRegistrations, setMyEventRegistrations] = useState<EventRegistration[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingVolunteer, setLoadingVolunteer] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [donationStats, setDonationStats] = useState({
    totalAmount: 0,
    totalDonations: 0,
    pendingDonations: 0
  });
  const [volunteersByUserId, setVolunteersByUserId] = useState<Volunteer[]>([]);
  const [volunteersByVolunteerId, setVolunteersByVolunteerId] = useState<Volunteer[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [isRegistrationDetailsOpen, setIsRegistrationDetailsOpen] = useState(false);

  // Check if user has admin role
  const isAdmin = user?.role === "admin";

  if (!user) return null;

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user?._id) return;
      
      try {
        setLoadingDonations(true);
        const response = await donationAPI.getMyDonations();
        const userDonations = response.data.donations || [];
        setDonations(userDonations);

        // Calculate donation stats - all donations are completed now
        const total = userDonations.reduce((sum: number, donation: Donation) => sum + donation.amount, 0);
        
        setDonationStats({
          totalAmount: total,
          totalDonations: userDonations.length,
          pendingDonations: 0 // Always 0 since all donations are completed
        });
      } catch (err) {
        console.error('Error fetching donations:', err);
        setDonations([]);
      } finally {
        setLoadingDonations(false);
      }
    };

    const fetchVolunteerProfile = async () => {
      if (!user?._id) return;
      
      try {
        setLoadingVolunteer(true);
        const response = await volunteerAPI.getMyVolunteerProfile();
        setVolunteer(response.data.data);
      } catch (err) {
        console.error('Error fetching volunteer profile:', err);
        setVolunteer(null);
      } finally {
        setLoadingVolunteer(false);
      }
    };

    const fetchAllVolunteers = async () => {
      if (!user?._id) return;
      try {
        setLoadingVolunteers(true);
        const [byUser, byVolunteer] = await Promise.all([
          volunteerAPI.getVolunteersByUserId(user._id),
          volunteerAPI.getVolunteersByVolunteerId(user._id),
        ]);
        setVolunteersByUserId(byUser.data.data || []);
        setVolunteersByVolunteerId(byVolunteer.data.data || []);
      } catch (err) {
        setVolunteersByUserId([]);
        setVolunteersByVolunteerId([]);
      } finally {
        setLoadingVolunteers(false);
      }
    };

    const fetchNetworkUsers = async () => {
      try {
        setLoadingNetwork(true);
        const res = await userAPI.getAllUsers();
        const all = res.data?.data || res.data || [];
        // Defensive filter: remove admin users if present
        const filtered = Array.isArray(all) ? all.filter((u:any) => !(u.roles && Array.isArray(u.roles) && u.roles.includes('admin'))) : [];
        setNetworkUsers(filtered || []);
      } catch (err) {
        console.error('Error fetching network users:', err);
        setNetworkUsers([]);
      } finally {
        setLoadingNetwork(false);
      }
    };

    const fetchMyRegistrations = async () => {
      if (!user?._id) return;
      try {
        setLoadingRegistrations(true);
        const response = await courseRegistrationAPI.getMyRegistrations();
        setMyRegistrations(response.data);
      } catch (err) {
        console.error('Error fetching course registrations:', err);
        setMyRegistrations([]);
      } finally {
        setLoadingRegistrations(false);
      }
    };

    const fetchMyEventRegistrations = async () => {
      if (!user?._id) return;
      try {
        setLoadingRegistrations(true);
        const response = await registrationAPI.getMyEventRegistrations();
        setMyEventRegistrations(response.data.registrations || []);
      } catch (err) {
        console.error('Error fetching event registrations:', err);
        setMyEventRegistrations([]);
      } finally {
        setLoadingRegistrations(false);
      }
    };

    fetchDonations();
    fetchVolunteerProfile();
    fetchAllVolunteers();
    fetchMyRegistrations();
    fetchMyEventRegistrations();
    fetchNetworkUsers();
  }, [user?._id]);

  const formatEventTime = (time?: { startTime: string; endTime: string }) => {
    if (!time) return null;
    return `${time.startTime} - ${time.endTime}`;
  };

  const getRegistrationStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { label: 'Completed', variant: 'success' as const };
      case 'approved':
        return { label: 'Approved', variant: 'success' as const };
      case 'rejected':
        return { label: 'Rejected', variant: 'destructive' as const };
      default:
        return { label: status, variant: 'secondary' as const };
    }
  };

  const upcomingEvents = myEventRegistrations
    .filter(reg => new Date(reg.eventDate) >= new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .map(reg => ({
      id: reg.event?._id,
      registrationId: reg._id,
      title: reg.eventName || reg.event?.title,
      date: reg.eventDate,
      time: reg.event?.time ? formatEventTime(reg.event.time) : null,
      location: reg.event?.location,
      status: reg.status,
      statusDisplay: getRegistrationStatus(reg.status),
      checkedIn: reg.checkedIn
    }));

  const pastEvents = myEventRegistrations
    .filter(reg => new Date(reg.eventDate) < new Date())
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    .map(reg => ({
      id: reg.event?._id,
      registrationId: reg._id,
      title: reg.eventName || reg.event?.title,
      date: reg.eventDate,
      time: reg.event?.time ? formatEventTime(reg.event.time) : null,
      location: reg.event?.location,
      status: reg.status,
      statusDisplay: getRegistrationStatus(reg.status),
      checkedIn: reg.checkedIn
    }));

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !selectedDonation) return;
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 80;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 40, 40, pdfWidth, pdfHeight);
    pdf.save(`donation-receipt-${selectedDonation._id}.pdf`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* User Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {getInitials(user?.email)}
                </AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-2xl font-semibold">Welcome{user?.firstName ? `, ${user.firstName}` : ''}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-2 w-full md:w-auto">
            <Button asChild variant="outline" size="sm">
              <Link to="/profile">
                <UserRound className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="border-b">
            <TabsList className="bg-transparent w-full justify-start">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                My Events
              </TabsTrigger>
              <TabsTrigger value="programs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                My Programs
              </TabsTrigger>
              <TabsTrigger value="volunteer" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Volunteering
              </TabsTrigger>
              <TabsTrigger value="donations" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Donations
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {upcomingEvents.length > 0 ? "Next: " + upcomingEvents[0].title : "No upcoming events"}
                  </p>
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link to="/events">View all events</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* DEBUG: show user state in dev for troubleshooting Join visibility */}
              {import.meta.env.DEV && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Debug: Auth State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs max-h-48 overflow-auto p-2 bg-slate-50 rounded border">{JSON.stringify({ id: user?._id, email: user?.email, gender: (user as any)?.gender, residenceType: user?.residenceType, customId: user?.customId }, null, 2)}</pre>
                    <div className="text-xs text-muted-foreground mt-2">If the join button isn't visible, paste the JSON above.</div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">My Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myRegistrations.length}</div>
                  <p className="text-xs text-muted-foreground">Active enrollments</p>
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link to="#programs">View my programs</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Volunteer Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {volunteer ? volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1) : 'Not Applied'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {volunteer ? `${volunteer.role} role` : 'Become a volunteer'}
                  </p>
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link to="#volunteer">View details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(donationStats.totalAmount, "INR")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {donationStats.totalDonations} donations
                  </p>
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link to="/donate">Make a donation</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">My Network</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingNetwork ? (
                    <div>Loading network...</div>
                  ) : networkUsers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No users found.</div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {networkUsers.slice(0,4).map((u:any)=> (
                        <div key={u._id || u.id} className="flex items-center justify-between p-3 border rounded bg-white">
                          <div>
                            <div className="font-medium">{(u.firstName || u.name) ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : (u.name || '—')}</div>
                            <div className="text-xs text-muted-foreground">{u.mobile || u.phone || '—'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{u.occupationProfile || u.occupationType || '—'}</div>
                            <div className="text-xs text-muted-foreground">{(u.buildingName ? u.buildingName + ', ' : '') + (u.flatNo || '')}</div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-2 text-center">
                        <div className="text-xs text-muted-foreground mb-2">Showing {Math.min(networkUsers.length,4)} of {networkUsers.length}</div>
                        <div className="flex justify-center gap-2">
                          <Button asChild>
                            <Link to="/network">View all network</Link>
                          </Button>
                          {isAdmin ? (
                            <Button variant="link" size="sm" asChild>
                              <Link to="/admin/users">Manage users</Link>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Family features removed: independent registrations use single `gender` field */}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent interactions with the center</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 2).map(event => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.date)} at {event.time}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/events/${event.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  {donations.slice(0, 1).map(donation => (
                    <div key={donation._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Donation of {donation.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/donations/history">
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  {volunteer && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Volunteer Application - {volunteer.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(volunteer.applicationDate)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="#volunteer">
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you might want to do</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto flex flex-col p-4 items-center justify-center" asChild>
                    <Link to="/events">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>View Events</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col p-4 items-center justify-center" asChild>
                    <Link to="/volunteering">
                      <Heart className="h-6 w-6 mb-2" />
                      <span>Volunteer</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col p-4 items-center justify-center" asChild>
                    <Link to="/donate">
                      <Gift className="h-6 w-6 mb-2" />
                      <span>Donate</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col p-4 items-center justify-center" asChild>
                    <Link to="/contact">
                      <Mail className="h-6 w-6 mb-2" />
                      <span>Contact Us</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Admin Section after Quick Actions Card */}
            {isAdmin && (
              <Card className="mt-4">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center">
                    <BadgeCheck className="h-5 w-5 mr-2 text-primary" />
                    Admin Controls
                  </CardTitle>
                  <CardDescription>Administrative functions for site management</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto flex flex-col p-4 items-center justify-center" asChild>
                      <Link to="/admin/donations">
                        <Gift className="h-6 w-6 mb-2" />
                        <span>Manage Donations</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto flex flex-col p-4 items-center justify-center" asChild>
                      <Link to="/admin/users">
                        <UserRound className="h-6 w-6 mb-2" />
                        <span>Manage Users</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto flex flex-col p-4 items-center justify-center" asChild>
                      <Link to="/admin/events">
                        <Calendar className="h-6 w-6 mb-2" />
                        <span>Manage Events</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Family join modal removed */}

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events you have registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRegistrations ? (
                  <p>Loading your events...</p>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map(event => (
                      <div key={event.registrationId} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(event.date)}
                              </span>
                              {event.time && (
                                <span className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {event.time}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={event.statusDisplay.variant}>
                                {event.statusDisplay.label}
                              </Badge>
                              {event.checkedIn && (
                                <Badge variant="success">Checked In</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedRegistrationId(event.registrationId);
                              setIsRegistrationDetailsOpen(true);
                            }}
                          >
                            View Registration
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/events/${event.id}`}>View Event</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You haven't registered for any upcoming events.</p>
                    <Button variant="outline" className="mt-2" asChild>
                      <Link to="/events">Browse Events</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {pastEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Past Events</CardTitle>
                  <CardDescription>Events you have previously attended</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastEvents.map(event => (
                      <div key={event.registrationId} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-muted p-3 rounded-full">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(event.date)}
                              </span>
                              {event.time && (
                                <span className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {event.time}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={event.statusDisplay.variant}>
                                {event.statusDisplay.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Registered Programs</CardTitle>
                <CardDescription>
                  Here are the courses and programs you are currently enrolled in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRegistrations ? (
                  <p>Loading your programs...</p>
                ) : myRegistrations.length > 0 ? (
                  <ul className="space-y-4">
                    {myRegistrations.map((reg) => (
                      <li key={reg._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <BookOpen className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-semibold">{reg.courseTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              Level: {reg.level} | Registered on: {formatDate(reg.date)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(reg.status)}>
                          {reg.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>You are not registered for any programs yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteer Tab */}
          <TabsContent value="volunteer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Volunteer Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingVolunteers ? (
                  <div className="text-center py-4">Loading volunteer applications...</div>
                ) : (
                  <div>
                    {volunteersByVolunteerId.length === 0 ? (
                      <div className="text-muted-foreground">No applications found for your volunteer ID.</div>
                    ) : (
                      <div className="space-y-4">
                        {volunteersByVolunteerId.map((v) => (
                          <div key={v._id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{v.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{v.email}</p>
                                <p className="text-xs">Role: {v.role}</p>
                                <p className="text-xs">Status: {v.status}</p>
                                <p className="text-xs">Applied: {formatDate(v.applicationDate)}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                              <Badge>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</Badge>
                                <Button variant="outline" size="sm" onClick={() => { setSelectedVolunteer(v); setVolunteerDialogOpen(true); }}>
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Volunteer Details Dialog */}
            <Dialog open={volunteerDialogOpen} onOpenChange={setVolunteerDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Volunteer Application Details</DialogTitle>
                </DialogHeader>
                {selectedVolunteer && (
                  <div className="space-y-2">
                    <div><b>Name:</b> {selectedVolunteer.fullName}</div>
                    <div><b>Email:</b> {selectedVolunteer.email}</div>
                    <div><b>Phone:</b> {selectedVolunteer.phone}</div>
                    <div><b>Address:</b> {selectedVolunteer.address}</div>
                    <div><b>Role:</b> {selectedVolunteer.role}</div>
                    <div><b>Experience:</b> {selectedVolunteer.experience}</div>
                    <div><b>Availability:</b> {selectedVolunteer.availability}</div>
                    <div><b>Motivation:</b> {selectedVolunteer.motivation}</div>
                    <div><b>Status:</b> {selectedVolunteer.status}</div>
                    <div><b>Applied:</b> {formatDate(selectedVolunteer.applicationDate)}</div>
                    {selectedVolunteer.approvedAt && <div><b>Approved At:</b> {formatDate(selectedVolunteer.approvedAt)}</div>}
                    {selectedVolunteer.approvedBy && <div><b>Approved By:</b> {selectedVolunteer.approvedBy}</div>}
                    {selectedVolunteer.rejectionReason && <div><b>Rejection Reason:</b> {selectedVolunteer.rejectionReason}</div>}
                  </div>
                )}
                <DialogClose asChild>
                  <Button variant="outline" className="mt-4 w-full">Close</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Donations</CardTitle>
                <CardDescription>
                  Track all your donations and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDonations ? (
                  <div className="text-center py-4">Loading donations...</div>
                ) : donations.length > 0 ? (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Amount</th>
                          <th className="px-4 py-2">Program</th>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map((donation) => (
                          <tr key={donation._id} className="border-b">
                            <td className="px-4 py-2">{formatDate(donation.createdAt)}</td>
                            <td className="px-4 py-2 font-medium">
                              {formatCurrency(donation.amount, donation.currency)}
                            </td>
                            <td className="px-4 py-2 capitalize">{donation.program}</td>
                            <td className="px-4 py-2">
                              {donation.donationType === "recurring" ? "Monthly" : "One-time"}
                            </td>
                            <td className="px-4 py-2">
                              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                Completed
                              </Badge>
                            </td>
                            <td className="px-4 py-2">
                              <Button variant="outline" size="sm" onClick={() => { setSelectedDonation(donation); setDonationDialogOpen(true); }}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No donations found. Make your first donation to support our cause!
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Donation Details Dialog */}
            <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
              <DialogContent className="sm:max-w-2xl p-0" style={{ maxWidth: 600, width: '95vw', marginTop: 32 }}>
                <DialogHeader>
                  <DialogTitle>Donation Receipt</DialogTitle>
                </DialogHeader>
                {selectedDonation && (
                  <div className="w-full flex flex-col items-center" style={{ background: '#f8fafc' }}>
                    <div ref={receiptRef} style={{
                      background: '#fff',
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 24px #0001',
                      maxWidth: 600,
                      margin: '0 auto',
                      padding: 0,
                      fontFamily: 'Inter, Arial, sans-serif',
                      color: '#222',
                    }}>
                      {/* Header */}
                      <div style={{
                        background: '#e0f3ec',
                        borderRadius: '16px 16px 0 0',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '20px 32px 12px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}>
                        <img src="/urbania-logo.png" alt="Urbania Connect Community Logo" style={{ height: 44, width: 44, borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#157347', fontFamily: 'Georgia, serif' }}>
                            Urbania <span style={{ color: '#222' }}>Connect Community</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#157347', fontWeight: 500 }}>Empowering Communities, Enriching Lives</div>
                        </div>
                      </div>
                      {/* Title and Info */}
                      <div style={{ padding: '24px 32px 0 32px' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Donation Receipt</div>
                        <div style={{ color: '#199e6a', fontWeight: 500, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                          Thank you for your generous contribution!
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 18 }}>
                          <div><b>Receipt No:</b> {selectedDonation?._id}</div>
                          <div><b>Date:</b> {formatDate(selectedDonation?.createdAt)}</div>
                          <div><b>Status:</b> {selectedDonation?.paymentDetails?.status || '-'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 32 }}>
                          {/* Donor Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#157347', marginBottom: 8 }}>Donor Details</div>
                            <div><b>Name:</b> {selectedDonation?.anonymous ? 'Anonymous Donor' : `${selectedDonation?.firstName} ${selectedDonation?.lastName}`}</div>
                            <div><b>Email:</b> {selectedDonation?.email}</div>
                          </div>
                          {/* Donation Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#157347', marginBottom: 8 }}>Donation Details</div>
                            <div><b>Program:</b> {selectedDonation?.program}</div>
                            <div><b>Type:</b> {selectedDonation?.donationType === 'recurring' ? 'Monthly' : 'One-time'}</div>
                            <div><b>Amount:</b> <span style={{ color: '#0a7d4f', fontWeight: 700 }}>{formatCurrency(selectedDonation?.amount, selectedDonation?.currency)}</span></div>
                            <div><b>Payment Method:</b> {selectedDonation?.paymentDetails?.method || '-'}</div>
                            <div><b>Transaction ID:</b> {selectedDonation?.paymentDetails?.transactionId || '-'}</div>
                          </div>
                        </div>
                      </div>
                      {/* Footer */}
                      <div style={{
                        borderTop: '1px dashed #e5e7eb',
                        padding: '16px 32px 8px 32px',
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#888',
                        borderRadius: '0 0 16px 16px',
                        marginTop: 24,
                      }}>
                        <div style={{ color: '#157347', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                          Thank you for making a difference!
                        </div>
                        <div style={{ color: '#444', fontSize: 12, marginBottom: 2 }}>
                          Urbania Connect Community | www.urbania.org | info@urbania.org
                        </div>
                        <div style={{ color: '#444', fontSize: 12 }}>
                          123 Main Street, Mumbai, Maharashtra, India
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                          This is a computer-generated receipt and does not require a signature.
                        </div>
                      </div>
                    </div>
                    <Button variant="default" className="mt-4 w-full" onClick={handleDownloadReceipt}>Download PDF</Button>
                  </div>
                )}
                <DialogClose asChild>
                  <Button variant="outline" className="mt-2 w-full">Close</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
      {selectedRegistrationId && (
        <EventRegistrationDetails
          registrationId={selectedRegistrationId}
          isOpen={isRegistrationDetailsOpen}
          onClose={() => {
            setIsRegistrationDetailsOpen(false);
            setSelectedRegistrationId(null);
          }}
        />
      )}
    </MainLayout>
  );
};

export default Dashboard; 