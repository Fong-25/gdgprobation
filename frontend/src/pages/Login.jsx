"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn, Mail, Lock } from "lucide-react";
import { AuthCard, PrimaryButton, AuthInputGroup, AuthLink } from "../components/AuthForms";

// Define input fields for Login page
const loginFields = [
  { id: "username", name: "username", label: "Username", type: "text", placeholder: "johndoe", Icon: Mail, isPassword: false },
  { id: "password", name: "password", label: "Password", type: "password", placeholder: "••••••••", Icon: Lock, isPassword: true },
];

export default function Login() {
  useEffect(() => {
    document.title = 'Login'
  }, [])
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (endpoint, payload) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
          credentials: "include", // For login
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      console.error("Auth error:", error);
      return { ok: false, data: { message: "Network error or something went wrong" } };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { ok, data } = await handleAuth("/api/auth/login", formData);

    if (ok) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error(data.message || "Login failed");
    }

    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      Icon={LogIn}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {loginFields.map((field) => (
          <AuthInputGroup
            key={field.id}
            {...field}
            value={formData[field.name]}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        ))}

        <PrimaryButton isLoading={isLoading} loadingText="Signing in...">
          Sign In
        </PrimaryButton>
      </form>

      <AuthLink
        text="Don't have an account?"
        to="/signup"
        linkText="Sign up"
      />
    </AuthCard>
  );
}