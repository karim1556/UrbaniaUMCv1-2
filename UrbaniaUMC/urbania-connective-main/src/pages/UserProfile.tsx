import React, { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Calendar, Camera, LoaderCircle } from "lucide-react";

const UserProfile = () => {
  const { user, getInitials, updateUserProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || user?.mobile || "",
    mobile: user?.mobile || user?.phone || "",
    address: user?.address || "",
    birthdate: user?.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : "",
    bio: user?.bio || "",
    buildingName: user?.buildingName || "",
    wing: user?.wing || "",
    flatNo: user?.flatNo || "",
    occupationProfile: user?.occupationProfile || "",
    occupationType: "",
    occupationDescription: "",
    workplaceAddress: user?.workplaceAddress || "",
    gender: (user?.gender as 'M' | 'F') || "",
    forumContribution: user?.forumContribution || "",
    residenceType: user?.residenceType || "",
  });
  

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        phone: user.phone || user.mobile || "",
        mobile: user.mobile || user.phone || "",
        address: user.address || "",
        birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : "",
        bio: user.bio || "",
        buildingName: user.buildingName || "",
        wing: user.wing || "",
        flatNo: user.flatNo || "",
        occupationProfile: user.occupationProfile || "",
        occupationType: "",
        occupationDescription: "",
        workplaceAddress: user.workplaceAddress || "",
        forumContribution: user.forumContribution || "",
        residenceType: user.residenceType || "",
          gender: (user.gender as 'M' | 'F') || "",
      });
      // clear deprecated family code
      // setFamilyCode removed
    }
  }, [user]);

  const location = useLocation();

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update user profile through auth context
      await updateUserProfile({
        firstName: profileData.firstName,
        middleName: profileData.middleName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        mobile: profileData.phone,
        address: profileData.address,
        birthdate: profileData.birthdate,
        bio: profileData.bio,
        buildingName: profileData.buildingName,
        wing: profileData.wing,
        flatNo: profileData.flatNo,
          occupationProfile: profileData.occupationType ? `${profileData.occupationType}${profileData.occupationDescription ? ' - ' + profileData.occupationDescription : ''}` : profileData.occupationDescription,
          workplaceAddress: profileData.workplaceAddress,
          forumContribution: profileData.forumContribution,
          residenceType: (profileData.residenceType === 'owner' || profileData.residenceType === 'tenant') ? profileData.residenceType : undefined,
          gender: profileData.gender || undefined,
      });
      
      // Refresh profile to ensure we have the latest data
      await refreshUserProfile();
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setProfileData({
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      phone: user.phone || user.mobile || "",
      mobile: user.mobile || user.phone || "",
      address: user.address || "",
      birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : "",
      bio: user.bio || "",
      buildingName: user.buildingName || "",
      wing: user.wing || "",
      flatNo: user.flatNo || "",
      occupationProfile: user.occupationProfile || "",
      occupationType: "",
      occupationDescription: user.occupationProfile || "",
      workplaceAddress: user.workplaceAddress || "",
      forumContribution: user.forumContribution || "",
      residenceType: user.residenceType || "",
      gender: (user.gender as 'M' | 'F') || "",
      // familyMembers removed
    });
    setIsEditing(false);
  };

  const displayUser = user;
  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user.name || user.username;
  const formattedBirthdate = user.birthdate ? new Date(user.birthdate).toLocaleDateString() : null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
                  
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center text-center pb-2">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {getInitials(`${user.firstName || ''} ${user.lastName || ''}`)}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : displayName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="text-sm text-muted-foreground mt-1">
                Member since {new Date(user?.createdAt || user?.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">First Name</div>
                    <div>{user?.firstName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Middle Name</div>
                    <div>{user?.middleName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Last Name</div>
                    <div>{user?.lastName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{user?.email}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div>{user?.phone || user?.mobile || "—"}</div>
                    </div>
                </div>
                {user.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div>{user?.address}</div>
                    </div>
                  </div>
                )}
                {formattedBirthdate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Birth Date</div>
                      <div>{formattedBirthdate}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Building Name</div>
                      <div>{displayUser?.buildingName}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wing</div>
                      <div>{displayUser?.wing}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Flat No</div>
                      <div>{displayUser?.flatNo}</div>
                    </div>
                </div>
                {displayUser?.residenceType && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Residence Type</div>
                      <div>{displayUser?.residenceType === 'owner' ? 'Owner' : displayUser?.residenceType === 'tenant' ? 'Tenant' : displayUser?.residenceType}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Edit Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Profile Information" : "Profile Information"}</CardTitle>
              <CardDescription>
                {isEditing 
                  ? "Update your personal information below" 
                  : "View your personal information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={profileData.firstName} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" name="middleName" value={profileData.middleName} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={profileData.lastName} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingName">Building Name</Label>
                    <Input id="buildingName" name="buildingName" value={profileData.buildingName} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wing">Wing</Label>
                    <Input id="wing" name="wing" value={profileData.wing} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flatNo">Flat No</Label>
                    <Input id="flatNo" name="flatNo" value={profileData.flatNo} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="residenceType">Residence Type</Label>
                    <select id="residenceType" name="residenceType" value={profileData.residenceType} onChange={handleInputChange} disabled={!isEditing} className="w-full border rounded px-3 py-2">
                      <option value="">Select</option>
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={profileData.phone} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Date of Birth</Label>
                    <Input id="birthdate" name="birthdate" type="date" value={profileData.birthdate} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profileData.gender} onValueChange={(v)=>setProfileData(prev=>({...prev, gender: v as 'M' | 'F'}))}>
                      <SelectTrigger id="gender" className="w-full" disabled={!isEditing}>
                        <SelectValue placeholder={profileData.gender || 'Select gender'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={profileData.address} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" name="bio" value={profileData.bio} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="occupationType">Occupation</Label>
                    <Select value={profileData.occupationType} onValueChange={(v)=>setProfileData(prev=>({...prev, occupationType: v}))}>
                      <SelectTrigger id="occupationType" className="w-full" disabled={!isEditing}>
                        <SelectValue placeholder={profileData.occupationType || (profileData.occupationDescription ? 'Selected' : 'Select occupation')} />
                      </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Salaried - Private Sector">Salaried – Private Sector</SelectItem>
                          <SelectItem value="Salaried - Government / PSU">Salaried – Government / PSU</SelectItem>
                          <SelectItem value="Business Owner / Proprietor">Business Owner / Proprietor</SelectItem>
                          <SelectItem value="Self-Employed Professional">Self-Employed Professional</SelectItem>
                          <SelectItem value="Freelancer / Consultant">Freelancer / Consultant</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Homemaker">Homemaker</SelectItem>
                          <SelectItem value="Retired">Retired</SelectItem>
                          <SelectItem value="Doctors">Doctors</SelectItem>
                          <SelectItem value="Other (Please Specify)">Other (Please Specify)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="occupationDescription">Other (Please Specify)</Label>
                    <Textarea id="occupationDescription" name="occupationDescription" value={profileData.occupationDescription} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="workplaceAddress">Workplace Address</Label>
                    <Input id="workplaceAddress" name="workplaceAddress" value={profileData.workplaceAddress} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="forumContribution">How I can contribute to this forum</Label>
                    <Input id="forumContribution" name="forumContribution" value={profileData.forumContribution} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={user.email} disabled />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile; 