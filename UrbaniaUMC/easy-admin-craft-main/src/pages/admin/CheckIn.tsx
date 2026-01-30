import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { eventService } from '@/services/event.service';
import { QrCode, CheckCircle, XCircle, Users, UserCheck, Clock, RefreshCw } from 'lucide-react';

interface CheckInResult {
    success: boolean;
    message: string;
    registration?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        eventName: string;
        eventDate: string;
        checkInTime?: string;
        totalAttendees: number;
        guests?: Array<{ name: string; age?: string }>;
    };
}

interface EventOption {
    _id: string;
    title: string;
    date: string;
}

interface RecentCheckIn {
    id: string;
    name: string;
    eventName: string;
    checkInTime: string;
    totalAttendees: number;
}

interface Attendee {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    checkInCode?: string;
    checkedIn: boolean;
    checkInTime?: string;
    totalAttendees: number;
}

const CheckIn = () => {
    const [code, setCode] = useState('');
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [events, setEvents] = useState<EventOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
    const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [stats, setStats] = useState({
        totalRegistered: 0,
        checkedIn: 0,
        remaining: 0
    });
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Fetch events for dropdown
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventService.getAllEvents(1, 100);
                const eventList = data.events || data || [];
                // Filter to upcoming events only
                const now = new Date();
                const upcomingEvents = eventList.filter((e: any) => {
                    const eventDate = new Date(e.date || e.dateTime?.start);
                    return eventDate >= now;
                });
                setEvents(upcomingEvents.map((e: any) => ({
                    _id: e._id,
                    title: e.title,
                    date: e.date || e.dateTime?.start
                })));
            } catch (error) {
                console.error('Error fetching events:', error);
                toast.error('Failed to load events');
            }
        };
        fetchEvents();
    }, []);

    // Fetch stats when event changes
    useEffect(() => {
        const fetchStats = async () => {
            if (!selectedEventId) {
                setStats({ totalRegistered: 0, checkedIn: 0, remaining: 0 });
                return;
            }
            try {
                const data = await eventService.getEventStats(selectedEventId);
                setStats({
                    totalRegistered: data.totalRegistrations || 0,
                    checkedIn: data.checkedIn || 0,
                    remaining: (data.totalRegistrations || 0) - (data.checkedIn || 0)
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, [selectedEventId, checkInResult]);

    // Fetch attendees when event changes or after check-in
    useEffect(() => {
        const fetchAttendees = async () => {
            if (!selectedEventId) {
                setAttendees([]);
                return;
            }
            try {
                setLoadingAttendees(true);
                const data = await eventService.getAllEventRegistrations(selectedEventId, 1, 200);
                const registrations = data.registrations || data || [];
                setAttendees(registrations);
            } catch (error) {
                console.error('Error fetching attendees:', error);
            } finally {
                setLoadingAttendees(false);
            }
        };
        fetchAttendees();
    }, [selectedEventId, checkInResult]);

    // Split attendees into checked-in and remaining
    const checkedInAttendees = attendees.filter(a => a.checkedIn);
    const remainingAttendees = attendees.filter(a => !a.checkedIn);

    const handleCheckIn = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!code.trim()) {
            toast.error('Please enter a check-in code');
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        setCheckInResult(null);

        try {
            const result = await eventService.checkInByCode(code.toUpperCase(), selectedEventId || undefined);

            setCheckInResult({
                success: true,
                message: result.message,
                registration: result.registration
            });

            // Add to recent check-ins
            if (result.registration) {
                setRecentCheckIns(prev => [{
                    id: result.registration.id,
                    name: result.registration.name,
                    eventName: result.registration.eventName,
                    checkInTime: result.registration.checkInTime || new Date().toISOString(),
                    totalAttendees: result.registration.totalAttendees
                }, ...prev].slice(0, 10)); // Keep only last 10
            }

            toast.success(result.message || 'Check-in successful!');
            setCode('');
            inputRef.current?.focus();
        } catch (error: any) {
            setCheckInResult({
                success: false,
                message: error.message || 'Check-in failed'
            });
            toast.error(error.message || 'Check-in failed');
            inputRef.current?.select();
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <QrCode className="h-8 w-8" />
                    Event Check-in
                </h1>
                <p className="text-muted-foreground mt-2">
                    Scan QR code or enter check-in code to verify attendee registration
                </p>
            </div>

            {/* Event Selection */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Select Event</CardTitle>
                    <CardDescription>Filter check-ins by event (optional)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedEventId || 'all'} onValueChange={(val) => setSelectedEventId(val === 'all' ? '' : val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Events" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            {events.map(event => (
                                <SelectItem key={event._id} value={event._id}>
                                    {event.title} - {formatDate(event.date)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            {selectedEventId && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Registered</p>
                                    <p className="text-2xl font-bold">{stats.totalRegistered}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Checked In</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
                                </div>
                                <UserCheck className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Remaining</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.remaining}</p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Check-in Form */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Enter Check-in Code</CardTitle>
                    <CardDescription>Type or scan the code from the attendee's QR ticket</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCheckIn} className="space-y-4">
                        <div className="flex gap-3">
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="EVT-XXXXXX"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="text-2xl font-mono text-center h-14 tracking-wider"
                                disabled={loading}
                                autoComplete="off"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                className="h-14 px-8"
                                disabled={loading || !code.trim()}
                            >
                                {loading ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Check In
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Check-in Result */}
                    {checkInResult && (
                        <div className={`mt-6 p-4 rounded-lg border-2 ${checkInResult.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                {checkInResult.success ? (
                                    <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                                ) : (
                                    <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className={`text-lg font-semibold ${checkInResult.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {checkInResult.message}
                                    </p>

                                    {checkInResult.registration && (
                                        <div className="mt-3 space-y-2">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Name:</span>
                                                    <p className="font-medium text-lg">{checkInResult.registration.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Party Size:</span>
                                                    <p className="font-medium text-lg">{checkInResult.registration.totalAttendees} person(s)</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Event:</span>
                                                    <p className="font-medium">{checkInResult.registration.eventName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Phone:</span>
                                                    <p className="font-medium">{checkInResult.registration.phone}</p>
                                                </div>
                                            </div>

                                            {checkInResult.registration.guests && checkInResult.registration.guests.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-muted-foreground text-sm mb-1">Guests:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {checkInResult.registration.guests.map((guest, i) => (
                                                            <Badge key={i} variant="secondary">
                                                                {guest.name} {guest.age ? `(${guest.age})` : ''}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Check-ins */}
            {recentCheckIns.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Check-ins</CardTitle>
                        <CardDescription>Last {recentCheckIns.length} check-ins this session</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentCheckIns.map((checkIn, index) => (
                                <div
                                    key={`${checkIn.id}-${index}`}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">{checkIn.name}</p>
                                            <p className="text-sm text-muted-foreground">{checkIn.eventName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline">{checkIn.totalAttendees} person(s)</Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatTime(checkIn.checkInTime)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Attendee Lists */}
            {selectedEventId && (
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Checked In Attendees */}
                    <Card>
                        <CardHeader className="bg-green-50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                                <CheckCircle className="h-5 w-5" />
                                Checked In ({checkedInAttendees.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingAttendees ? (
                                <div className="p-4 text-center text-muted-foreground">Loading...</div>
                            ) : checkedInAttendees.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">No check-ins yet</div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto">
                                    {checkedInAttendees.map((attendee) => (
                                        <div key={attendee._id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/30">
                                            <div>
                                                <p className="font-medium">{attendee.firstName} {attendee.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{attendee.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="default" className="bg-green-600">✓ In</Badge>
                                                {attendee.checkInTime && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatTime(attendee.checkInTime)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Remaining Attendees */}
                    <Card>
                        <CardHeader className="bg-orange-50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                                <Clock className="h-5 w-5" />
                                Remaining ({remainingAttendees.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingAttendees ? (
                                <div className="p-4 text-center text-muted-foreground">Loading...</div>
                            ) : remainingAttendees.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">All attendees checked in! 🎉</div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto">
                                    {remainingAttendees.map((attendee) => (
                                        <div key={attendee._id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/30">
                                            <div>
                                                <p className="font-medium">{attendee.firstName} {attendee.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{attendee.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                {attendee.checkInCode && (
                                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                                        {attendee.checkInCode}
                                                    </code>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CheckIn;
