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
    occupationDescription: user?.occupationProfile || "",
    workplaceAddress: user?.workplaceAddress || "",
    familyCount: user?.familyCount || "",
    maleAbove18: user?.maleAbove18 || "",
    maleAbove60: user?.maleAbove60 || "",
    maleUnder18: user?.maleUnder18 || "",
    femaleAbove18: user?.femaleAbove18 || "",
    femaleAbove60: user?.femaleAbove60 || "",
    femaleUnder18: user?.femaleUnder18 || "",
    forumContribution: user?.forumContribution || "",
    residenceType: user?.residenceType || "",
    familyMembers: user?.familyMembers || [] as any[],
  });
  const [familyCode, setFamilyCode] = useState<string | null>(null);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      const effectiveUser = (user as any).isFamilyMember && (user as any).owner ? (user as any).owner : user;
      setProfileData({
        firstName: effectiveUser.firstName || "",
        middleName: effectiveUser.middleName || "",
        lastName: effectiveUser.lastName || "",
        phone: effectiveUser.phone || effectiveUser.mobile || "",
        mobile: effectiveUser.mobile || effectiveUser.phone || "",
        address: effectiveUser.address || "",
        birthdate: effectiveUser.birthdate ? new Date(effectiveUser.birthdate).toISOString().split('T')[0] : "",
        bio: effectiveUser.bio || "",
        buildingName: effectiveUser.buildingName || "",
        wing: effectiveUser.wing || "",
        flatNo: effectiveUser.flatNo || "",
        occupationProfile: effectiveUser.occupationProfile || "",
        occupationType: "",
        occupationDescription: effectiveUser.occupationProfile || "",
        workplaceAddress: effectiveUser.workplaceAddress || "",
        familyCount: effectiveUser.familyCount || "",
        maleAbove18: effectiveUser.maleAbove18 || "",
        maleAbove60: effectiveUser.maleAbove60 || "",
        maleUnder18: effectiveUser.maleUnder18 || "",
        femaleAbove18: effectiveUser.femaleAbove18 || "",
        femaleAbove60: effectiveUser.femaleAbove60 || "",
        femaleUnder18: effectiveUser.femaleUnder18 || "",
        forumContribution: effectiveUser.forumContribution || "",
        residenceType: effectiveUser.residenceType || "",
        familyMembers: effectiveUser.familyMembers || [] as any[],
      });
      // set family code if present
      setFamilyCode((user as any).familyCode || null);
    }
  }, [user]);

  // Family members state (for editing)
  const [familyMembers, setFamilyMembers] = useState<Array<any>>([]);
  const location = useLocation();
  const familyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user) {
      const effectiveUser = (user as any).isFamilyMember && (user as any).owner ? (user as any).owner : user;
      // Ensure self (owner) is included as first member
      const selfMember = {
        name: `${effectiveUser.firstName || ''} ${effectiveUser.lastName || ''}`.trim(),
        email: effectiveUser.email,
        age: effectiveUser.birthdate ? new Date().getFullYear() - new Date(effectiveUser.birthdate).getFullYear() : undefined,
        category: 'self'
      };
      const others = Array.isArray(effectiveUser.familyMembers) ? effectiveUser.familyMembers : [];
      const hasSelf = others.some((m: any) => m.email && m.email.toLowerCase() === (effectiveUser.email || '').toLowerCase());
      const combined = hasSelf ? others : [selfMember, ...others];
      setFamilyMembers(combined);
    }
  }, [user]);

  // If navigated from Dashboard with ?edit=family, open editor and scroll to family
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const edit = params.get('edit');
    if (edit === 'family') {
      // don't allow family-member sessions to open edit mode
      if (!(user as any).isFamilyMember) {
        setIsEditing(true);
      }
      // scroll to family section after a tick
      setTimeout(() => {
        familyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [location.search]);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        occupationType: profileData.occupationType || undefined,
        occupationDescription: profileData.occupationDescription || undefined,
        workplaceAddress: profileData.workplaceAddress,
        familyCount: profileData.familyCount === '' ? undefined : Number(profileData.familyCount),
        maleAbove18: profileData.maleAbove18 === '' ? undefined : Number(profileData.maleAbove18),
        maleAbove60: profileData.maleAbove60 === '' ? undefined : Number(profileData.maleAbove60),
        maleUnder18: profileData.maleUnder18 === '' ? undefined : Number(profileData.maleUnder18),
        femaleAbove18: profileData.femaleAbove18 === '' ? undefined : Number(profileData.femaleAbove18),
        femaleAbove60: profileData.femaleAbove60 === '' ? undefined : Number(profileData.femaleAbove60),
        femaleUnder18: profileData.femaleUnder18 === '' ? undefined : Number(profileData.femaleUnder18),
        forumContribution: profileData.forumContribution,
        residenceType: profileData.residenceType || undefined,
        familyMembers: familyMembers.filter((m) => m && (m.name || m.email))
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
      familyCount: user.familyCount || "",
      maleAbove18: user.maleAbove18 || "",
      maleAbove60: user.maleAbove60 || "",
      maleUnder18: user.maleUnder18 || "",
      femaleAbove18: user.femaleAbove18 || "",
      femaleAbove60: user.femaleAbove60 || "",
      femaleUnder18: user.femaleUnder18 || "",
      forumContribution: user.forumContribution || "",
      familyMembers: user.familyMembers || [] as any[],
    });
    setIsEditing(false);
  };

  const displayUser = user?.isFamilyMember && (user as any).owner ? (user as any).owner : user;
  const displayName = displayUser?.name || `${displayUser?.firstName || ''} ${displayUser?.lastName || ''}`.trim() || user.name || user.username;
  const formattedBirthdate = displayUser?.birthdate ? new Date(displayUser.birthdate).toLocaleDateString() : (user.birthdate ? new Date(user.birthdate).toLocaleDateString() : null);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          {!isEditing ? (
            // Do not allow family-member accounts to edit profile
            !user?.isFamilyMember ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : null
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
                  {/* Owner: family code generation */}
                  {!isEditing && !(user as any).isFamilyMember && (
                    <div className="mt-4">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">Family Code:</div>
                        <div className="text-sm text-muted-foreground">{familyCode || 'Not generated'}</div>
                        <Button size="sm" onClick={async ()=>{
                          try {
                            const { data } = await (await import('@/lib/api')).userAPI.generateFamilyCode();
                            setFamilyCode(data.code || data);
                            // refresh profile to show updates
                            await refreshUserProfile();
                            toast.success('Family code generated');
                          } catch (err) { console.error(err); toast.error('Failed to generate code'); }
                        }}>{familyCode ? 'Regenerate' : 'Generate'}</Button>
                      </div>
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
                        <SelectItem value="Doctor">Doctor</SelectItem>
                        <SelectItem value="Engineer">Engineer</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                        <SelectItem value="Social worker">Social worker</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="occupationDescription">Brief Profile</Label>
                    <Textarea id="occupationDescription" name="occupationDescription" value={profileData.occupationDescription} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="workplaceAddress">Workplace Address</Label>
                    <Input id="workplaceAddress" name="workplaceAddress" value={profileData.workplaceAddress} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="familyCount">Family Members (Total)</Label>
                    <Input id="familyCount" name="familyCount" type="number" value={profileData.familyCount} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maleAbove18">Males (18-60)</Label>
                    <Input id="maleAbove18" name="maleAbove18" type="number" value={profileData.maleAbove18} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maleAbove60">Males (Above 60)</Label>
                    <Input id="maleAbove60" name="maleAbove60" type="number" value={profileData.maleAbove60} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maleUnder18">Males (Under 18)</Label>
                    <Input id="maleUnder18" name="maleUnder18" type="number" value={profileData.maleUnder18} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="femaleAbove18">Females (18-60)</Label>
                    <Input id="femaleAbove18" name="femaleAbove18" type="number" value={profileData.femaleAbove18} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="femaleAbove60">Females (Above 60)</Label>
                    <Input id="femaleAbove60" name="femaleAbove60" type="number" value={profileData.femaleAbove60} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="femaleUnder18">Females (Under 18)</Label>
                    <Input id="femaleUnder18" name="femaleUnder18" type="number" value={profileData.femaleUnder18} onChange={handleInputChange} disabled={!isEditing} />
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
                {/* My Family Section */}
                <div className="mt-6" ref={familyRef}>
                  <h3 className="text-lg font-semibold mb-2">My Family</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add family members up to the number you specified in your profile. One entry for yourself is pre-filled.</p>
                  <div className="space-y-4">
                    {familyMembers.map((member, idx) => (
                      <div key={idx} className="p-3 border rounded flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input value={member.name} onChange={(e)=>{
                              const updated = [...familyMembers]; updated[idx] = { ...updated[idx], name: e.target.value }; setFamilyMembers(updated);
                            }} />
                          </div>
                          <div>
                            <Label className="text-xs">Email</Label>
                            <Input value={member.email} disabled={idx===0} onChange={(e)=>{
                              const updated = [...familyMembers]; updated[idx] = { ...updated[idx], email: e.target.value }; setFamilyMembers(updated);
                            }} />
                          </div>
                          <div>
                            <Label className="text-xs">Age</Label>
                            <Input type="number" value={member.age || ''} onChange={(e)=>{
                              const updated = [...familyMembers]; updated[idx] = { ...updated[idx], age: e.target.value ? Number(e.target.value) : undefined }; setFamilyMembers(updated);
                            }} />
                          </div>
                          <div>
                            <Label className="text-xs">Category</Label>
                            <select value={member.category || ''} onChange={(e)=>{
                              const newCat = e.target.value;
                              // compute allowed and used counts
                              const allowedMap: Record<string, number> = {
                                male_18_60: Number(profileData.maleAbove18 || 0),
                                male_above_60: Number(profileData.maleAbove60 || 0),
                                male_under_18: Number(profileData.maleUnder18 || 0),
                                female_18_60: Number(profileData.femaleAbove18 || 0),
                                female_above_60: Number(profileData.femaleAbove60 || 0),
                                female_under_18: Number(profileData.femaleUnder18 || 0)
                              };
                              const usage: Record<string, number> = { male_18_60:0, male_above_60:0, male_under_18:0, female_18_60:0, female_above_60:0, female_under_18:0 };
                              familyMembers.forEach((m, i) => {
                                if (m && m.category) {
                                  usage[m.category] = (usage[m.category] || 0) + (i===idx && m.category===newCat ? 0 : 1);
                                }
                              });
                              const allowed = allowedMap[newCat] || 0;
                              const currentlyUsed = usage[newCat] || 0;
                              // allow if currentlyUsed < allowed, or if allowed==0 but this member already has that category
                              const alreadyAssignedToThis = member.category === newCat;
                              if (!newCat) {
                                const updated = [...familyMembers]; updated[idx] = { ...updated[idx], category: '' }; setFamilyMembers(updated);
                                return;
                              }
                              if (allowed > 0 && currentlyUsed >= allowed && !alreadyAssignedToThis) {
                                toast.error('Category limit reached.');
                                return;
                              }
                              // Accept selection
                              const updated = [...familyMembers]; updated[idx] = { ...updated[idx], category: newCat }; setFamilyMembers(updated);
                            }} className="w-full border rounded px-2 py-1">
                              <option value="">Select</option>
                              {/* Only show categories that user has counts for or already assigned */}
                              {Number(profileData.maleAbove18 || 0) > 0 || familyMembers.some(m=>m.category==='male_18_60') ? <option value="male_18_60">Male (18-60)</option> : null}
                              {Number(profileData.maleAbove60 || 0) > 0 || familyMembers.some(m=>m.category==='male_above_60') ? <option value="male_above_60">Male (Above 60)</option> : null}
                              {Number(profileData.maleUnder18 || 0) > 0 || familyMembers.some(m=>m.category==='male_under_18') ? <option value="male_under_18">Male (Under 18)</option> : null}
                              {Number(profileData.femaleAbove18 || 0) > 0 || familyMembers.some(m=>m.category==='female_18_60') ? <option value="female_18_60">Female (18-60)</option> : null}
                              {Number(profileData.femaleAbove60 || 0) > 0 || familyMembers.some(m=>m.category==='female_above_60') ? <option value="female_above_60">Female (Above 60)</option> : null}
                              {Number(profileData.femaleUnder18 || 0) > 0 || familyMembers.some(m=>m.category==='female_under_18') ? <option value="female_under_18">Female (Under 18)</option> : null}
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        {isEditing && idx!==0 && !(user as any).isFamilyMember && (
                          <div>
                            <Button type="button" variant="destructive" onClick={() =>{
                              const updated = [...familyMembers]; updated.splice(idx,1); setFamilyMembers(updated);
                            }}>Remove</Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <div className="flex gap-2 items-center">
                        <Button type="button" onClick={()=>{
                          const max = profileData.familyCount ? Number(profileData.familyCount) : undefined;
                          const currentCount = familyMembers.length;
                          if (max && currentCount >= max) { toast.error(`You can only add up to ${max} members.`); return; }
                          setFamilyMembers(prev=>[...prev, { name: '', email: '', age: undefined, category: '' }]);
                        }}>Add Member</Button>
                        <div className="text-sm text-muted-foreground">Members allowed: {profileData.familyCount || '—'}</div>
                      </div>
                    )}
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