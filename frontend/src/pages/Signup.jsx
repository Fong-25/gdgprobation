"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { AuthCard, PrimaryButton, AuthInputGroup, AuthLink } from "../components/AuthForms";

// Define input fields for Signup page
const signupFields = [
  { id: "username", name: "username", label: "Username", type: "text", placeholder: "johndoe", Icon: User },
  { id: "email", name: "email", label: "Email", type: "email", placeholder: "you@example.com", Icon: Mail },
  { id: "password", name: "password", label: "Password", type: "password", placeholder: "••••••••", Icon: Lock, isPassword: true },
  { id: "confirmPassword", name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••", Icon: Lock, isPassword: true },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (endpoint, payload) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
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
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const { ok, data } = await handleAuth("/api/auth/signup", {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (ok) {
      toast.success("Account created successfully!");
      navigate("/login");
    } else {
      toast.error(data.message || "Signup failed");
    }

    setIsLoading(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <AuthCard
      title="Create Account"
      subtitle="Sign up to start tracking your mind"
      Icon={UserPlus}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {signupFields.map((field) => (
          <AuthInputGroup
            key={field.id}
            {...field}
            value={formData[field.name]}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        ))}

        <PrimaryButton isLoading={isLoading} loadingText="Creating account...">
          Create Account
        </PrimaryButton>
      </form>

      <AuthLink
        text="Already have an account?"
        to="/login"
        linkText="Sign in"
      />
    </AuthCard>
  );
}