import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  CheckCheck,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Educational Programs data
const educationalPrograms = [
  {
    id: "islamic-studies",
    title: "Islamic Studies Program",
    subtitle: "Comprehensive Islamic education for all ages",
    description: "Learn about Islamic beliefs, practices, and history in a structured curriculum.",
    fullDescription: "Our Islamic Studies Program offers a comprehensive curriculum designed to provide students with a solid foundation in Islamic knowledge. Courses cover Aqeedah (beliefs), Fiqh (jurisprudence), Seerah (Prophetic biography), Quran, and Islamic history. Classes are available for different age groups and knowledge levels, from beginners to advanced learners. Our qualified instructors combine traditional Islamic scholarship with contemporary teaching methods to make learning engaging and relevant.",
    image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=800&auto=format&fit=crop",
    category: "religious",
    level: "All Levels",
    schedule: "Weekends, 10:00 AM - 12:00 PM",
    location: "Main Center Classrooms",
    instructor: "Various Qualified Instructors",
    duration: "Semester-based (16 weeks)",
    capacity: 30,
    cost: "₹200 per semester (scholarships available)",
    registration: true,
    registrationLink: "/education/register/islamic-studies",
    features: [
      "Age-appropriate curriculum",
      "Qualified and experienced teachers",
      "Small class sizes for personalized attention",
      "Regular progress assessments",
      "End of semester certificates",
      "Parent involvement opportunities"
    ],
    outcomes: [
      "Understanding of core Islamic beliefs and practices",
      "Basic Arabic language skills for religious texts",
      "Quran memorization and tajweed rules",
      "Knowledge of Islamic history and civilization",
      "Development of Islamic character and ethics"
    ]
  },
  {
    id: "quran-memorization",
    title: "Quran Memorization",
    subtitle: "Structured program for memorizing the Holy Quran",
    description: "Comprehensive program for memorizing the Quran with proper tajweed.",
    fullDescription: "Our Quran Memorization Program provides a structured approach to memorizing the Holy Quran. Students work with experienced huffaz (those who have memorized the entire Quran) who guide them through a systematic memorization process. The program emphasizes proper tajweed (rules of recitation), understanding of the text, and techniques for long-term retention. Students progress at their own pace with regular revisions and assessments to ensure solid memorization.",
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=800&auto=format&fit=crop",
    category: "religious",
    level: "Beginner to Advanced",
    schedule: "Monday-Thursday, 5:00 PM - 7:00 PM",
    location: "Quran Center",
    instructor: "Hafiz Abdullah & Hafiza Fatima",
    duration: "Ongoing program",
    capacity: 25,
    cost: "₹150 monthly (scholarships available)",
    registration: true,
    registrationLink: "/education/register/quran-memorization",
    features: [
      "Individualized pace and attention",
      "Certified Quran teachers (Huffaz)",
      "Proper tajweed instruction",
      "Regular revision sessions",
      "Quarterly assessment",
      "Annual Quran competition"
    ],
    outcomes: [
      "Memorization of selected surahs or complete Quran",
      "Proper tajweed and recitation skills",
      "Understanding of memorized portions",
      "Techniques for ongoing revision and retention",
      "Spiritual connection with the Quran"
    ]
  },
  {
    id: "arabic-language",
    title: "Arabic Language Courses",
    subtitle: "Learn Modern Standard Arabic",
    description: "Courses for beginners to advanced learners focusing on practical Arabic skills.",
    fullDescription: "Our Arabic Language Program offers comprehensive courses for learners at all levels, from complete beginners to advanced students. The curriculum focuses on Modern Standard Arabic (Fusha) with practical applications for both conversational skills and Quranic understanding. Classes cover reading, writing, grammar, vocabulary, and conversation. Our experienced instructors use interactive teaching methods to make language learning engaging and effective. Small class sizes ensure personalized attention and ample practice opportunities.",
    image: "https://images.unsplash.com/photo-1590486603245-a8694ced9db5?q=80&w=800&auto=format&fit=crop",
    category: "language",
    level: "Beginner, Intermediate, Advanced",
    schedule: "Tuesday & Thursday evenings, 6:30 PM - 8:30 PM",
    location: "Language Lab",
    instructor: "Prof. Layla Hassan",
    duration: "12 weeks per level",
    capacity: 15,
    cost: "₹250 per level",
    registration: true,
    registrationLink: "/education/register/arabic-language",
    features: [
      "Small class sizes (max 15 students)",
      "Native-speaking instructors",
      "Interactive teaching methods",
      "Audio-visual learning materials",
      "Weekly conversation practice",
      "Comprehensive textbooks included"
    ],
    outcomes: [
      "Reading and writing in Arabic script",
      "Basic to advanced conversation skills",
      "Understanding of Arabic grammar",
      "Expanded vocabulary",
      "Cultural knowledge and context",
      "Foundation for Quranic Arabic"
    ]
  },
  {
    id: "youth-leadership",
    title: "Youth Leadership Program",
    subtitle: "Developing tomorrow's community leaders",
    description: "Leadership development program for Muslim youth ages 14-18.",
    fullDescription: "The Youth Leadership Program is designed to develop leadership skills, Islamic identity, and civic engagement among Muslim teenagers. Through a combination of workshops, mentoring, community service projects, and team-building activities, participants develop practical leadership skills grounded in Islamic values. The program emphasizes personal development, community responsibility, and the cultivation of leadership qualities that will serve youth throughout their lives. Participants work on real community projects, giving them hands-on experience in making a positive difference.",
    image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop",
    category: "youth",
    level: "Ages 14-18",
    schedule: "Saturday afternoons, 2:00 PM - 5:00 PM",
    location: "Youth Center",
    instructor: "Brother Ahmad & Sister Noor",
    duration: "6 months program",
    capacity: 20,
    cost: "₹300 for full program (scholarships available)",
    registration: true,
    registrationLink: "/education/register/youth-development",
    features: [
      "Interactive workshops and seminars",
      "Mentorship from community leaders",
      "Community service projects",
      "Public speaking training",
      "Team-building activities",
      "Leadership retreats"
    ],
    outcomes: [
      "Developed leadership and communication skills",
      "Strengthened Islamic identity",
      "Project management experience",
      "Conflict resolution abilities",
      "Network of peers and mentors",
      "Community service portfolio"
    ]
  },
  {
    id: "new-muslims",
    title: "New Muslims Course",
    subtitle: "Essential Islamic knowledge for new Muslims",
    description: "Supportive learning environment for those new to Islam.",
    fullDescription: "Our New Muslims Course provides essential knowledge and support for individuals who have recently embraced Islam. The curriculum covers fundamental Islamic beliefs, practices, and lifestyle in a welcoming, supportive environment. Topics include Tawheed (monotheism), salah (prayer), sawm (fasting), zakat (charity), and hajj (pilgrimage), as well as practical guidance for incorporating Islamic practices into daily life. The course also addresses common challenges faced by new Muslims and provides a supportive community of peers and mentors. One-on-one support is available in addition to group classes.",
    image: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?q=80&w=800&auto=format&fit=crop",
    category: "religious",
    level: "Newcomers to Islam",
    schedule: "Sunday evenings, 6:00 PM - 8:00 PM",
    location: "Community Room",
    instructor: "Imam Yusuf",
    duration: "8 weeks (courses run quarterly)",
    capacity: 15,
    cost: "Free",
    registration: true,
    registrationLink: "/education/register/new-muslims",
    features: [
      "Comfortable learning environment",
      "Basic Islamic materials provided",
      "Prayer instruction and practice",
      "Social integration activities",
      "Ongoing mentorship opportunities",
      "Celebration of milestones"
    ],
    outcomes: [
      "Understanding of core Islamic beliefs",
      "Ability to perform daily prayers",
      "Knowledge of Islamic values and ethics",
      "Comfort with basic Islamic terminology",
      "Strategies for practicing Islam in daily life",
      "Connection to the Muslim community"
    ]
  },
  {
    id: "children-quran-club",
    title: "Children's Quran Club",
    subtitle: "Fun and interactive Quran learning for kids",
    description: "Engaging program teaching Quran reading, memorization, and values to children.",
    fullDescription: "The Children's Quran Club makes learning the Quran enjoyable and accessible for young children ages 5-12. Through engaging activities, games, stories, and age-appropriate lessons, children develop a love for the Quran while learning to read, recite, and understand basic concepts. The program incorporates modern educational methods with traditional Quranic teaching, creating an experience that captures children's interest and inspires their spiritual growth. Classes are divided by age group to ensure content is appropriate and engaging for each developmental stage.",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop",
    category: "children",
    level: "Ages 5-12 (grouped by age)",
    schedule: "Saturday mornings, 10:00 AM - 12:00 PM",
    location: "Children's Learning Center",
    instructor: "Sister Aisha & Brother Omar",
    duration: "Ongoing program (follows school year)",
    capacity: 25,
    cost: "₹100 per month",
    registration: true,
    registrationLink: "/education/register/children-quran-club",
    features: [
      "Age-appropriate curriculum",
      "Interactive learning activities",
      "Quranic stories and lessons",
      "Arabic alphabet and reading",
      "Basic memorization of short surahs",
      "Islamic values and character building"
    ],
    outcomes: [
      "Basic Quran reading skills",
      "Memorization of short surahs",
      "Understanding of Quranic stories",
      "Development of Islamic identity",
      "Love for learning about Islam",
      "Friendship with Muslim peers"
    ]
  },
  {
    id: "sisters-circle",
    title: "Sisters' Circle Program",
    subtitle: "A supportive space for spiritual growth and community",
    description: "Discussion group for women focusing on Islamic topics and community support.",
    fullDescription: "The Sisters' Circle is a weekly gathering for women to connect, learn, and grow together in a supportive and spiritual environment. We discuss a range of topics relevant to Muslim women today, from Quranic reflections and Seerah to contemporary issues and personal development. It's a safe space to share experiences, seek advice, and build lasting friendships with sisters in the community.",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop",
    category: "community",
    level: "All levels welcome",
    schedule: "Wednesdays, 11:00 AM - 1:00 PM",
    location: "Sisters' Area",
    instructor: "Sister Aisha",
    duration: "Ongoing weekly sessions",
    capacity: 20,
    cost: "₹40 per month",
    registration: true,
    registrationLink: "/education/register/sisters-circle",
    features: [
      "Welcoming and non-judgmental atmosphere",
      "Relevant topics for contemporary Muslim women",
      "Led by an experienced female scholar",
      "Opportunities for open discussion and Q&A",
      "Social and networking opportunities",
      "Childcare available upon request"
    ],
    outcomes: [
      "Strengthened sisterhood and community bonds",
      "Deeper understanding of Islamic concepts",
      "Increased confidence in practicing Islam",
      "A reliable support system",
      "Personal and spiritual growth"
    ]
  },
  {
    id: "weekend-school",
    title: "Weekend Islamic School",
    subtitle: "Nurturing the next generation of Muslims",
    description: "Comprehensive weekend program for children covering Islamic studies, Quran, and Arabic.",
    fullDescription: "Our Weekend Islamic School offers a comprehensive and engaging curriculum for children aged 5-14. The program is designed to provide a strong foundation in Islamic studies, Quranic reading and memorization, and the Arabic language in a positive and nurturing environment. Our goal is to instill a love for Islam and a strong Muslim identity in our children. The curriculum is divided into multiple levels based on age and existing knowledge, ensuring that each child learns at an appropriate pace.",
    image: "https://images.unsplash.com/photo-1614935399432-3e4a52745348?q=80&w=800&auto=format&fit=crop",
    category: "children",
    level: "Ages 5-14 (multiple levels)",
    schedule: "Saturdays, 10:00 AM - 2:00 PM",
    location: "Education Wing",
    instructor: "Team of Qualified Teachers",
    duration: "Full Academic Year",
    capacity: 60,
    cost: "₹75 per month",
    registration: true,
    registrationLink: "/education/register/weekend-school",
    features: [
      "Structured curriculum for different age groups",
      "Qualified and vetted teachers",
      "Interactive and engaging teaching methods",
      "Focus on character development (akhlaq)",
      "Regular parent-teacher communication",
      "Annual graduation and awards ceremony"
    ],
    outcomes: [
      "Ability to read the Quran with basic tajweed",
      "Memorization of key surahs and duas",
      "Understanding of fundamental Islamic beliefs and practices",
      "Basic proficiency in the Arabic language",
      "Strong sense of Muslim identity and community belonging"
    ]
  }
];

const EducationalProgram = () => {
  const { id } = useParams<{ id: string }>();
  const program = educationalPrograms.find(p => p.id === id);

  if (!program) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Program Not Found</h1>
          <p className="mb-6">The educational program you are looking for does not exist.</p>
          <Button asChild>
            <Link to="/education">Back to Education</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Find related programs (same category)
  const relatedPrograms = educationalPrograms
    .filter(p => p.category === program.category && p.id !== program.id)
    .slice(0, 3);

  return (
    <MainLayout>
      <div className="relative h-[40vh] lg:h-[50vh] overflow-hidden">
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent">
          <div className="container mx-auto px-4 md:px-6 h-full flex flex-col justify-end pb-12">
            <div className="max-w-3xl">
              <div className="mb-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {program.category.charAt(0).toUpperCase() + program.category.slice(1)}
                </Badge>
                {program.registration && (
                  <Badge className="ml-2 bg-green-500">
                    Registration Open
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-medium mb-2 text-white">
                {program.title}
              </h1>
              <p className="text-xl text-white/80 font-medium">
                {program.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h2 className="text-2xl font-display font-medium mb-4">About This Program</h2>
              <p className="text-muted-foreground mb-8">
                {program.fullDescription}
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Program Features:</h3>
                  <ul className="space-y-2">
                    {program.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Learning Outcomes:</h3>
                  <ul className="space-y-2">
                    {program.outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-1" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link to={program.registrationLink}>
                    Register for This Program
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/contact?subject=Question about ${program.title}`}>
                    Ask a Question
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h3 className="font-medium text-lg mb-4">Program Information</h3>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <span className="block font-medium">Level:</span>
                    <span>{program.level}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <span className="block font-medium">Schedule:</span>
                    <span>{program.schedule}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <span className="block font-medium">Duration:</span>
                    <span>{program.duration}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <span className="block font-medium">Location:</span>
                    <span>{program.location}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <span className="block font-medium">Instructor:</span>
                    <span>{program.instructor}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <span className="block font-medium">Class Size:</span>
                    <span>Maximum {program.capacity} students</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="font-medium text-lg text-primary">
                    Cost: {program.cost}
                  </div>
                </div>
              </div>
            </div>

            {relatedPrograms.length > 0 && (
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h3 className="font-medium text-lg mb-4">Similar Programs</h3>
                <div className="space-y-4">
                  {relatedPrograms.map(relatedProgram => (
                    <div key={relatedProgram.id} className="group">
                      <Link to={`/education/${relatedProgram.id}`} className="block">
                        <div className="relative h-28 rounded-md overflow-hidden mb-2">
                          <img
                            src={relatedProgram.image}
                            alt={relatedProgram.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {relatedProgram.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{relatedProgram.level}</p>
                      </Link>
                    </div>
                  ))}

                  <Link
                    to="/education"
                    className="text-primary flex items-center hover:underline mt-2 pt-2 border-t"
                  >
                    View All Programs
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Ready to Enroll?</h2>
            <p className="text-muted-foreground mb-8">
              Registration is quick and easy. Secure your spot in our {program.title} program today.
              Limited seats available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to={program.registrationLink}>Register Now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/education">Explore Other Programs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EducationalProgram;
