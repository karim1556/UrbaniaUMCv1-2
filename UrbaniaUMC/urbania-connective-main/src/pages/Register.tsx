
import { Link } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";
import MainLayout from "@/components/layout/MainLayout";

const Register = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Create Your Account</h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join our community to access our full range of services and features.
              </p>
            </div>
          </div>
          <div className="mx-auto flex w-full flex-col space-y-6 sm:w-[350px] md:w-[400px]">
            <RegisterForm />
            <div className="text-center text-sm">
              <Link to="/" className="text-primary hover:underline">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
