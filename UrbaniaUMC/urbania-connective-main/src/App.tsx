import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/authContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Education from "./pages/Education";
import EducationalProgram from "./pages/EducationalProgram";
import About from "./pages/About";
import Volunteering from "./pages/Volunteering";
import Registration from "./pages/Registration";
import Donate from "./pages/Donate";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import UserSettings from "./pages/UserSettings";
import Network from "./pages/Network";
import ProtectedRoute from "./components/ProtectedRoute";
import DonationsDashboard from "./pages/admin/DonationsDashboard";
import Chatbot from "./Chatbot";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DonationSuccess from "./pages/DonationSuccess";
import EventRegistration from "./pages/registration/EventRegistration";
import RegistrationSuccess from "./pages/registration/RegistrationSuccess";
import CourseRegistration from "./pages/CourseRegistration";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <Chatbot />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:eventId/eventregistrationform" element={<EventRegistration />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/education" element={<Education />} />
            <Route path="/education/:id" element={<EducationalProgram />} />
            <Route path="/education/register/:courseId" element={<CourseRegistration />} />
            <Route path="/about" element={<About />} />
            <Route path="/volunteering" element={<Volunteering />} />
            <Route path="/donation-success" element={<DonationSuccess />} />

            {/* Protected Routes */}
            <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
            <Route path="/registration" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
            <Route path="/registration/:type" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
            <Route path="/registration/success" element={<RegistrationSuccess />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
            <Route path="/admin/donations" element={<ProtectedRoute><DonationsDashboard /></ProtectedRoute>} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
