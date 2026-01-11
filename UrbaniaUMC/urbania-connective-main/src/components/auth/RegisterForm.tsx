import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { handleAuthRedirect } from "@/lib/utils/auth";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [wing, setWing] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [occupationType, setOccupationType] = useState("");
  const [occupationDescription, setOccupationDescription] = useState("");
  const [workplaceAddress, setWorkplaceAddress] = useState("");
  const [familyCount, setFamilyCount] = useState("");
  const [maleAbove18, setMaleAbove18] = useState("");
  const [maleAbove60, setMaleAbove60] = useState("");
  const [maleUnder18, setMaleUnder18] = useState("");
  const [femaleAbove18, setFemaleAbove18] = useState("");
  const [femaleAbove60, setFemaleAbove60] = useState("");
  const [femaleUnder18, setFemaleUnder18] = useState("");
  const [forumContribution, setForumContribution] = useState("");
  const [residenceType, setResidenceType] = useState<'owner' | 'tenant' | ''>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // If already authenticated, redirect to home or intended destination
  const state = location.state as { from?: string } | null;
  const redirectPath = state?.from || "/";

  if (isAuthenticated) {
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading || submitted) {
      return;
    }

    // Validation
    const errors = [];

    if (password !== confirmPassword) {
      errors.push("Passwords do not match");
    }

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (!firstName || firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters long");
    }
    if (!lastName || lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters long");
    }
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      errors.push("Please enter a valid 10-digit mobile number");
    }

    if (!email || !email.includes('@')) {
      errors.push("Please enter a valid email address");
    }

    if (!buildingName || buildingName.trim().length < 1) {
      errors.push("Building name is required");
    }
    if (!wing || wing.trim().length < 1) {
      errors.push("Wing is required");
    }
    if (!flatNo || flatNo.trim().length < 1) {
      errors.push("Flat number is required");
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        password,
        buildingName: buildingName.trim(),
        wing: wing.trim(),
        flatNo: flatNo.trim(),
        birthdate: birthdate || undefined,
        occupationProfile: occupationType ? `${occupationType}${occupationDescription ? ' - ' + occupationDescription.trim() : ''}` : occupationDescription.trim() || undefined,
        occupationType: occupationType || undefined,
        occupationDescription: occupationDescription.trim() || undefined,
        workplaceAddress: workplaceAddress.trim(),
        familyCount: familyCount ? parseInt(familyCount) : undefined,
        maleAbove18: maleAbove18 ? parseInt(maleAbove18) : undefined,
        maleAbove60: maleAbove60 ? parseInt(maleAbove60) : undefined,
        maleUnder18: maleUnder18 ? parseInt(maleUnder18) : undefined,
        femaleAbove18: femaleAbove18 ? parseInt(femaleAbove18) : undefined,
        femaleAbove60: femaleAbove60 ? parseInt(femaleAbove60) : undefined,
        femaleUnder18: femaleUnder18 ? parseInt(femaleUnder18) : undefined,
        forumContribution: forumContribution.trim(),
        residenceType: residenceType || undefined,
      });

      toast.success("Registration successful! Please log in to continue.");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 p-6 rounded-xl bg-card shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-display font-semibold tracking-tight">Account Created!</h1>
          <p className="text-muted-foreground text-sm">
            Your account has been successfully created. You can now login.
          </p>
        </div>

        <Button
          onClick={() => navigate('/login')}
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-8 rounded-xl bg-card shadow-sm">
      <div className="space-y-2 text-center px-6 pt-8 md:px-0 md:pt-0">
        <h1 className="text-3xl font-display font-semibold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Sign up to access all our services and features
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1 w-full">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input id="middleName" placeholder="Middle" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="birthdate">DOB</Label>
            <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input id="mobile" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} required maxLength={10} minLength={10} type="tel" className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" />
          </div>
        </div>
        <div className="space-y-1 w-full">
          <Label htmlFor="occupationType">Occupation</Label>
          <Select value={occupationType} onValueChange={setOccupationType}>
            <SelectTrigger id="occupationType" className="w-full">
              <SelectValue placeholder="Select occupation" />
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
        <div className="space-y-1 w-full">
          <Label htmlFor="occupationDescription">Brief Description</Label>
          <Textarea id="occupationDescription" placeholder="Describe your role or experience" value={occupationDescription} onChange={(e) => setOccupationDescription(e.target.value)} className="w-full" />
        </div>
        <div className="space-y-1 w-full">
          <Label htmlFor="workplaceAddress">Workplace Address</Label>
          <Input id="workplaceAddress" placeholder="Workplace address" value={workplaceAddress} onChange={(e) => setWorkplaceAddress(e.target.value)} className="w-full" />
        </div>
        <div className="space-y-1 w-full">
          <Label htmlFor="familyCount">Count of Family Members</Label>
          <Input id="familyCount" type="number" min="0" value={familyCount} onChange={(e) => setFamilyCount(e.target.value)} className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1 w-full">
            <Label htmlFor="maleAbove18">Male (18-60)</Label>
            <Input id="maleAbove18" type="number" min="0" value={maleAbove18} onChange={(e) => setMaleAbove18(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="maleAbove60">Male (Above 60)</Label>
            <Input id="maleAbove60" type="number" min="0" value={maleAbove60} onChange={(e) => setMaleAbove60(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="maleUnder18">Male (under 18)</Label>
            <Input id="maleUnder18" type="number" min="0" value={maleUnder18} onChange={(e) => setMaleUnder18(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="femaleAbove18">Female (18-60)</Label>
            <Input id="femaleAbove18" type="number" min="0" value={femaleAbove18} onChange={(e) => setFemaleAbove18(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="femaleAbove60">Female (Above 60)</Label>
            <Input id="femaleAbove60" type="number" min="0" value={femaleAbove60} onChange={(e) => setFemaleAbove60(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="femaleUnder18">Female (under 18)</Label>
            <Input id="femaleUnder18" type="number" min="0" value={femaleUnder18} onChange={(e) => setFemaleUnder18(e.target.value)} className="w-full" />
          </div>
        </div>
        <div className="space-y-1 w-full">
          <Label htmlFor="forumContribution">How I can contribute to this forum</Label>
          <Input id="forumContribution" placeholder="Describe how you can contribute" value={forumContribution} onChange={(e) => setForumContribution(e.target.value)} className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-6 items-end">
          <div className="space-y-1 w-full">
            <Label htmlFor="buildingName">Building Name</Label>
            <Select value={buildingName} onValueChange={setBuildingName} required>
              <SelectTrigger id="buildingName" className="w-full" >
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rustomjee Azziano">Rustomjee Azziano</SelectItem>
                <SelectItem value="Rustomjee Aurelia">Rustomjee Aurelia</SelectItem>
                <SelectItem value="Rustomjee Accura">Rustomjee Accura</SelectItem>
                <SelectItem value="Rustomjee Atelier">Rustomjee Atelier</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="wing">Wing</Label>
            <Select value={wing} onValueChange={setWing} required>
              <SelectTrigger id="wing" className="w-full" >
                <SelectValue placeholder="Select Wing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A Wing</SelectItem>
                <SelectItem value="B">B Wing</SelectItem>
                <SelectItem value="C">C Wing</SelectItem>
                <SelectItem value="D">D Wing</SelectItem>
                <SelectItem value="E">E Wing</SelectItem>
                <SelectItem value="F">F Wing</SelectItem>
                <SelectItem value="G">G Wing</SelectItem>
                <SelectItem value="H">H Wing</SelectItem>
                <SelectItem value="I">I Wing</SelectItem>
                <SelectItem value="J">J Wing</SelectItem>
                <SelectItem value="K">K Wing</SelectItem>
                <SelectItem value="L">L Wing</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="residenceType">Residence Type</Label>
            <select id="residenceType" value={residenceType} onChange={(e) => setResidenceType(e.target.value as 'owner' | 'tenant' | '')} className="w-full border rounded px-3 py-2">
              <option value="">Select</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="flatNo">Flat No</Label>
            <Input id="flatNo" placeholder="101" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} required className="w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1 w-full">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full" />
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full" />
          </div>
        </div>
        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
