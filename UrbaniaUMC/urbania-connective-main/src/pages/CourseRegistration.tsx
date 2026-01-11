import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BookOpen, FileText, GraduationCap, Users, Calendar, MapPin, Clock, User, ChevronRight, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  levels: string[];
  schedule: string;
  location: string;
  instructor: string;
  enrollmentFee: string;
  capacity: string;
  color: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  address: string;
  level: string;
  experience: string;
  preferredSchedule: string;
  specialRequests: string;
  guardianName: string;
  guardianContact: string;
}

interface Errors {
  [key: string]: string;
}

interface Touched {
  [key: string]: boolean;
}

const courses: Course[] = [
  {
    id: "islamic-studies",
    title: "Islamic Studies",
    description: "Learn about Islamic principles, history, and practices in a structured curriculum.",
    icon: BookOpen,
    levels: ["Beginner", "Intermediate", "Advanced"],
    schedule: "Sundays, 10:00 AM - 12:00 PM",
    location: "Main Hall",
    instructor: "Imam Abdullah",
    enrollmentFee: "$50 per month",
    capacity: "30 students per class",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "quran-memorization",
    title: "Quran Memorization",
    description: "Structured program for memorizing the Quran with proper tajweed and understanding.",
    icon: BookOpen,
    levels: ["Children (7-12)", "Youth (13-18)", "Adults (19+)"],
    schedule: "Saturdays & Sundays, 9:00 AM - 11:00 AM",
    location: "Prayer Hall",
    instructor: "Shaykh Mohammad",
    enrollmentFee: "$60 per month",
    capacity: "20 students per class",
    color: "bg-blue-50 text-blue-700",
  },
  {
    id: "arabic-language",
    title: "Arabic Language",
    description: "Comprehensive Arabic language program covering reading, writing, and conversation.",
    icon: FileText,
    levels: ["Beginner", "Intermediate", "Advanced"],
    schedule: "Tuesdays & Thursdays, 6:00 PM - 8:00 PM",
    location: "Classroom 2",
    instructor: "Professor Layla",
    enrollmentFee: "$55 per month",
    capacity: "25 students per class",
    color: "bg-amber-50 text-amber-700",
  },
  {
    id: "youth-development",
    title: "Youth Leadership Program",
    description: "Program designed to develop leadership skills, confidence, and Islamic character in youth.",
    icon: Users,
    levels: ["Middle School", "High School"],
    schedule: "Fridays, 5:00 PM - 7:00 PM",
    location: "Youth Center",
    instructor: "Brother Yousef",
    enrollmentFee: "$45 per month",
    capacity: "15 students per class",
    color: "bg-purple-50 text-purple-700",
  },
  {
    id: "sisters-circle",
    title: "Sisters' Circle",
    description: "Discussion group for women focusing on Islamic topics and community support.",
    icon: Users,
    levels: ["All levels welcome"],
    schedule: "Wednesdays, 11:00 AM - 1:00 PM",
    location: "Sisters' Area",
    instructor: "Sister Aisha",
    enrollmentFee: "$40 per month",
    capacity: "20 participants",
    color: "bg-pink-50 text-pink-700",
  },
  {
    id: "weekend-school",
    title: "Weekend Islamic School",
    description: "Comprehensive weekend program for children covering Islamic studies, Quran, and Arabic.",
    icon: GraduationCap,
    levels: ["Ages 5-7", "Ages 8-10", "Ages 11-14"],
    schedule: "Saturdays, 10:00 AM - 2:00 PM",
    location: "Education Wing",
    instructor: "Multiple Teachers",
    enrollmentFee: "$75 per month",
    capacity: "60 students total",
    color: "bg-green-50 text-green-700",
  },
  {
    id: "new-muslims",
    title: "New Muslims Course",
    description: "Supportive learning environment for those new to Islam.",
    icon: Users,
    levels: ["Newcomers to Islam"],
    schedule: "Sunday evenings, 6:00 PM - 8:00 PM",
    location: "Community Room",
    instructor: "Imam Yusuf",
    enrollmentFee: "Free",
    capacity: "15 participants",
    color: "bg-teal-50 text-teal-700",
  },
  {
    id: "children-quran-club",
    title: "Children's Quran Club",
    description: "Engaging program teaching Quran reading, memorization, and values to children.",
    icon: BookOpen,
    levels: ["Ages 5-12"],
    schedule: "Saturday mornings, 10:00 AM - 12:00 PM",
    location: "Children's Learning Center",
    instructor: "Sister Aisha & Brother Omar",
    enrollmentFee: "$100 per month",
    capacity: "25 participants",
    color: "bg-cyan-50 text-cyan-700",
  },
];

const steps = [
  { label: "Personal Info" },
  { label: "Course Details" },
  { label: "Review & Submit" },
];

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  address: "",
  level: "",
  experience: "",
  preferredSchedule: "",
  specialRequests: "",
  guardianName: "",
  guardianContact: "",
};

const isChildCourse = (course: Course | undefined): boolean => {
  return !!course && (course.id === "weekend-school" || course.levels.some((l: string) => l.toLowerCase().includes("age")));
};

const CourseRegistration = () => {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const [form, setForm] = useState<FormState>({ ...initialForm, level: course?.levels[0] || "" });
  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [touched, setTouched] = useState<Touched>({});

  if (!course) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  // --- Validation ---
  const errors: Errors = {};
  if (step === 0) {
    if (!form.name) errors.name = "Name is required";
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = "Valid email required";
    if (!form.phone) errors.phone = "Phone is required";
    if (!form.age || isNaN(Number(form.age))) errors.age = "Valid age required";
    if (!form.gender) errors.gender = "Gender is required";
    if (!form.address) errors.address = "Address is required";
  }
  if (step === 1) {
    if (!form.level) errors.level = "Level is required";
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const nextStep = () => {
    setTouched({});
    setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/course-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId: user?._id,
          courseId: course.id,
          courseTitle: course.title,
        }),
      });
      if (response.ok) {
        toast.success("Registration submitted! We will contact you soon.");
        navigate("/education");
      } else {
        const data = await response.json();
        toast.error(data.message || "Submission failed.");
      }
    } catch (err) {
      toast.error("Network/server error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = course.icon;

  // --- Stepper UI ---
  const Stepper = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((s, idx) => (
        <div key={s.label} className="flex items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 transition-all duration-300
            ${idx < step ? 'bg-primary text-white border-primary' : idx === step ? 'bg-white border-primary text-primary' : 'bg-muted text-muted-foreground border-muted-foreground/30'}`}
          >
            {idx < step ? <CheckCircle className="w-5 h-5" /> : idx + 1}
          </div>
          {idx < steps.length - 1 && <ChevronRight className="mx-2 text-muted-foreground" />}
        </div>
      ))}
    </div>
  );

  // --- Step Content ---
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium" htmlFor="name">Full Name</label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
              {touched.name && errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
              {touched.email && errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="phone">Phone</label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
              {touched.phone && errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="age">Age</label>
              <Input id="age" name="age" value={form.age} onChange={handleChange} autoComplete="age" />
              {touched.age && errors.age && <div className="text-red-500 text-xs mt-1">{errors.age}</div>}
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {touched.gender && errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium" htmlFor="address">Address</label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} autoComplete="street-address" placeholder="123 Main Street, Houston, TX 77001" />
              {touched.address && errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium" htmlFor="level">Level</label>
              <select id="level" name="level" value={form.level} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                {course.levels.map((level: string, idx: number) => (
                  <option key={idx} value={level}>{level}</option>
                ))}
              </select>
              {touched.level && errors.level && <div className="text-red-500 text-xs mt-1">{errors.level}</div>}
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="experience">Prior Experience (optional)</label>
              <Input id="experience" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 2 years in similar course" />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="preferredSchedule">Preferred Schedule (optional)</label>
              <Input id="preferredSchedule" name="preferredSchedule" value={form.preferredSchedule} onChange={handleChange} placeholder="e.g. Morning" />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium" htmlFor="specialRequests">Special Requests (optional)</label>
              <Input id="specialRequests" name="specialRequests" value={form.specialRequests} onChange={handleChange} placeholder="Would prefer evening classes if possible." />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium mb-2 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Personal Info</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><span className="font-medium">Name:</span> {form.name}</div>
              <div><span className="font-medium">Email:</span> {form.email}</div>
              <div><span className="font-medium">Phone:</span> {form.phone}</div>
              <div><span className="font-medium">Age:</span> {form.age}</div>
              <div><span className="font-medium">Gender:</span> {form.gender}</div>
              <div className="md:col-span-2"><span className="font-medium">Address:</span> {form.address}</div>
            </div>
            <Separator />
            <div className="text-lg font-medium mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Course Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><span className="font-medium">Level:</span> {form.level}</div>
              <div><span className="font-medium">Experience:</span> {form.experience || "-"}</div>
              <div><span className="font-medium">Preferred Schedule:</span> {form.preferredSchedule || "-"}</div>
              <div className="md:col-span-2"><span className="font-medium">Special Requests:</span> {form.specialRequests || "-"}</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- Main Render ---
  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-10 md:py-16 min-h-[90vh]">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="flex flex-col items-center mb-8">
            <img src="/images/websitelogo.png" alt="Logo" className="h-16 mb-4" />
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-center">
              Register for {course.title}
            </h1>
            <p className="text-muted-foreground text-center max-w-xl">
              {course.description}
            </p>
          </div>
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${course.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">{course.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">{course.instructor}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm"><Calendar className="h-4 w-4 mr-2 text-primary" /> {course.schedule}</div>
                <div className="flex items-center text-sm"><MapPin className="h-4 w-4 mr-2 text-primary" /> {course.location}</div>
                <div className="flex items-center text-sm"><Clock className="h-4 w-4 mr-2 text-primary" /> {course.enrollmentFee}</div>
                <div className="flex items-center text-sm"><Users className="h-4 w-4 mr-2 text-primary" /> {course.capacity}</div>
              </div>
              <Separator className="my-4" />
              <div>
                <div className="font-medium mb-2">Available Levels:</div>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {course.levels.map((level: string, idx: number) => (
                    <li key={idx}>{level}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border shadow-sm p-6 space-y-6 animate-fade-in">
            <Stepper />
            {renderStep()}
            <div className="flex justify-between mt-8">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              <div className="flex-1" />
              {step < steps.length - 1 && (
                <Button type="button" onClick={nextStep} disabled={Object.keys(errors).length > 0}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === steps.length - 1 && (
                <Button type="submit" className="ml-auto" disabled={submitting}>
                  {submitting ? "Submitting..." : `Submit Registration`}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseRegistration; 