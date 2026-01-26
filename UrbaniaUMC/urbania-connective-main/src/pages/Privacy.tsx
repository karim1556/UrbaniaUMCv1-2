import React, { useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Separator } from "../components/ui/separator";

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="pt-20 container mx-auto px-4 md:px-6">
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-4">
            This Privacy Policy explains how Urbania Welfare Community Center collects, uses,
            and protects your personal information. We are committed to protecting your privacy
            and ensuring you have a positive experience on our website.
          </p>

          <h2 className="text-lg font-medium mt-4 mb-2">Information We Collect</h2>
          <p className="text-muted-foreground mb-4">We may collect contact details, usage data, and information you provide when registering or contacting us.</p>

          <h2 className="text-lg font-medium mt-4 mb-2">How We Use Information</h2>
          <p className="text-muted-foreground mb-4">We use information to provide services, process donations, communicate with you, and improve our site.</p>

          <h2 className="text-lg font-medium mt-4 mb-2">Third-Party Services</h2>
          <p className="text-muted-foreground mb-4">We may use third-party services for analytics, payments, and hosting. Please refer to those providers' privacy policies for details.</p>

          <h2 className="text-lg font-medium mt-4 mb-2">Contact</h2>
          <p className="text-muted-foreground">If you have questions about this Privacy Policy, contact us at info@urbaniawelfare.org.</p>
        </div>
      </div>
      <Separator />
    </MainLayout>
  );
};

export default Privacy;
