import React, { useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Separator } from "../components/ui/separator";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="pt-20 container mx-auto px-4 md:px-6">
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <h1 className="text-2xl font-semibold mb-4">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-4">
            These Terms and Conditions govern your use of the Urbania Welfare Community Center website. By using the site you agree to these terms.
          </p>

          <h2 className="text-lg font-medium mt-4 mb-2">Use of Site</h2>
          <p className="text-muted-foreground mb-4">You may use the site for lawful purposes. You agree not to misuse the site or interfere with its operation.</p>

          <h2 className="text-lg font-medium mt-4 mb-2">Donations & Payments</h2>
          <p className="text-muted-foreground mb-4">Donations are processed by third-party payment providers and are subject to their terms and fees.</p>

          <h2 className="text-lg font-medium mt-4 mb-2">Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">We are not liable for indirect damages arising from use of the site to the extent permitted by law.</p>

          <h2 className="text-lg font-medium mt-4 mb-2">Contact</h2>
          <p className="text-muted-foreground">Questions about these Terms can be directed to info@urbaniawelfare.org.</p>
        </div>
      </div>
      <Separator />
    </MainLayout>
  );
};

export default Terms;
