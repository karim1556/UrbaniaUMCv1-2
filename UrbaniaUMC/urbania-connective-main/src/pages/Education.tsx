import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, FileText, Calendar, Clock, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  {
    id: "islamic-studies",
    title: "Islamic Studies",
    description: "Learn about Islamic principles, history, and practices in a structured curriculum.",
    icon: BookOpen,
    levels: ["Beginner", "Intermediate", "Advanced"],
    schedule: "Sundays, 10:00 AM - 12:00 PM",
    location: "Main Hall",
    instructor: "Imam Abdullah",
    enrollmentFee: "₹50 per month",
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
    enrollmentFee: "₹60 per month",
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
    enrollmentFee: "₹55 per month",
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
    enrollmentFee: "₹45 per month",
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
    enrollmentFee: "₹40 per month",
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
    enrollmentFee: "₹75 per month",
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
    enrollmentFee: "₹100 per month",
    capacity: "25 participants",
    color: "bg-cyan-50 text-cyan-700",
  },
];

const Education = () => {
  const [activeCourse, setActiveCourse] = useState(courses[0].id);

  const selectedCourse = courses.find(course => course.id === activeCourse) || courses[0];

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">
              Education Programs
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our diverse educational programs designed to foster knowledge,
              understanding, and personal growth within an Islamic framework.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Courses Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-medium">Courses & Classes</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Select a course from the list to see more details and register. We offer a variety of classes for all ages and levels.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 bg-primary/5 border-b">
                  <h2 className="font-medium text-lg">Available Courses</h2>
                </div>
                <nav className="p-2">
                  <ul className="space-y-1">
                    {courses.map((course) => {
                      const Icon = course.icon;
                      return (
                        <li key={course.id}>
                          <button
                            onClick={() => setActiveCourse(course.id)}
                            className={cn(
                              "w-full flex items-center text-left px-3 py-2 rounded-md text-sm transition-colors",
                              activeCourse === course.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-accent/50 text-foreground/80"
                            )}
                          >
                            <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{course.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className={cn(
                    "w-14 h-14 rounded-lg mb-6 flex items-center justify-center",
                    selectedCourse.color
                  )}>
                    {React.createElement(selectedCourse.icon, { className: "h-7 w-7" })}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-display font-medium mb-4">
                    {selectedCourse.title}
                  </h2>

                  <p className="text-muted-foreground mb-6">
                    {selectedCourse.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-background/50 rounded-lg p-4 border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Schedule
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedCourse.schedule}</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4 border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        Location
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedCourse.location}</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4 border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        Instructor
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedCourse.instructor}</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4 border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        Enrollment Fee
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedCourse.enrollmentFee}</p>
                    </div>
                  </div>

                  <h3 className="font-medium mb-3">Available Levels:</h3>
                  <ul className="list-disc pl-5 mb-6 text-sm text-muted-foreground space-y-1">
                    {selectedCourse.levels.map((level, index) => (
                      <li key={index}>{level}</li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild>
                      <Link to={`/education/register/${selectedCourse.id}`}>
                        Register for This Course
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/contact">
                        Request More Information
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Join Our Learning Community</h2>
            <p className="text-muted-foreground mb-8">
              Education is a lifelong journey. Enroll in our programs and be part of a supportive
              community dedicated to learning and growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Education Department</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Education;
