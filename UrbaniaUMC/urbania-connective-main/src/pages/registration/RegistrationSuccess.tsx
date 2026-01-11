import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Data passed via state from registration form
  const { event, registration } = location.state || {};

  if (!event || !registration) {
    // If no data, redirect to events page
    navigate("/events");
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto pt-24 pb-8">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Registration Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <img
                  src={(Array.isArray(event.images) && event.images.length > 0) ? event.images[0] : (event.image || "/default-event.png")}
                  alt={event.title}
                  className="w-32 h-32 object-cover rounded-full border mb-2"
                  style={{ background: '#f3f4f6' }}
                />
                <h2 className="text-xl font-bold mt-2 mb-1">{event.title}</h2>
                <div className="text-muted-foreground text-sm mb-1">{event.location}</div>
                <div className="text-muted-foreground text-sm mb-1">
                  {event.dateTime ? new Date(event.dateTime).toLocaleDateString() : ""}
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Your Registration</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Name:</strong> {registration.firstName} {registration.lastName}</div>
                  <div><strong>Email:</strong> {registration.email}</div>
                  <div><strong>Phone:</strong> {registration.phone}</div>
                  <div><strong>Amount Paid:</strong> ₹{registration.totalAmount}</div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={() => navigate(`/events/${event._id}`)}>
                  View Event
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard?tab=events')}>
                  My Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegistrationSuccess; 