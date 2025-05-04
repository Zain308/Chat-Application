import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, Eye, EyeOff, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";

// Custom Toast Components
const showSuccessToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-slideIn" : "animate-slideOut"
      } max-w-md w-full bg-success text-success-content rounded-xl shadow-lg p-4 flex items-center gap-3 transition-all duration-300`}
    >
      <CheckCircle className="size-6" />
      <div>
        <h3 className="font-bold">Success</h3>
        <p>{message}</p>
      </div>
    </div>
  ), {
    duration: 3000,
    position: "top-right",
  });
};

const showErrorToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-slideIn" : "animate-slideOut"
      } max-w-md w-full bg-error text-error-content rounded-xl shadow-lg p-4 flex items-center gap-3 transition-all duration-300`}
    >
      <AlertTriangle className="size-6" />
      <div>
        <h3 className="font-bold">Error</h3>
        <p>{message}</p>
      </div>
    </div>
  ), {
    duration: 3000,
    position: "top-right",
  });
};

// CSS Animations
const toastStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = toastStyles;
  document.head.appendChild(styleSheet);
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(", ");
      showErrorToast(errorMessages);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData);
      showSuccessToast("Logged in successfully!");
      navigate("/HomePage");
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Login failed");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2 group mb-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Log In</h1>
              <p className="text-base-content/60">Access your Chatty account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 ${errors.email ? "input-error" : ""}`}
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-error mt-1">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-error mt-1">{errors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </div>
          </form>

          {/* Signup Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-base-content/60">
              Don’t have an account?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - decorative */}
      <AuthImagePattern
        title="Welcome back"
        subtitle="Log in to connect with your community and manage your projects."
      />
    </div>
  );
};

export default LoginPage;