import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Activity,
    Settings,
    ChevronLeft,
    Save
} from 'lucide-react';
import { format } from 'date-fns';

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = React.useState("profile");

    // Fetch user details
    const { data: user, isLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userService.getUserById(userId as string),
    });

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: (data: any) => userService.updateUser(userId as string, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update user');
        }
    });

    const handleUpdateUser = async (data: any) => {
        try {
            await updateUserMutation.mutateAsync(data);
        } catch (error) {
            // Error handled by mutation
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500">
                User not found
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline">{user.roles.join(', ')}</Badge>
                    <Button onClick={() => toast.info('Save feature coming soon')}>
                        <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(String(v))}>
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue={user.firstName} onChange={(e) => handleUpdateUser({ firstName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue={user.lastName} onChange={(e) => handleUpdateUser({ lastName: e.target.value })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">No recent activity available.</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {user.roles.map((role) => (
                                    <div key={role} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Shield className="h-5 w-5 text-muted-foreground" />
                                            <span>{role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">Security settings are currently read-only.</div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserDetails; 