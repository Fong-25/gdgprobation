"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function AuthInputGroup({
  id,
  name,
  label,
  value,
  onChange,
  disabled,
  placeholder,
  Icon,
  isPassword = false,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : "text";
  const paddingClass = Icon ? "pl-10 pr-4" : "px-4";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-violet-400 mb-2 "
      >
        {label}
      </label>
      <div className="relative rounded-lg border border-violet-400">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-100" />
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${paddingClass} ${
            isPassword ? "pr-12" : "pr-4"
          } py-3 bg-indigo-800 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-purple-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={placeholder}
          autoComplete='true'
          required={required}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-100 hover:text-violet-300 transition-colors"
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function PrimaryButton({
  isLoading = false,
  loadingText = "Loading...",
  children,
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`text-purple-100 w-full py-3 font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function AuthCard({ children, title, subtitle, Icon }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900 p-4 ">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-8 relative border-violet-400">
        <div className="flex items-center justify-center mb-8 p-3 rounded-full">
          {Icon && <Icon className="w-8 h-8 text-purple-100" />}
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-purple-100">
          {title}
        </h1>
        <p className="text-center text-purple-100 mb-8">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function AuthLink({ text, to, linkText }) {
  return (
    <p className="text-center mt-6 text-sm text-purple-100">
      {text}{" "}
      <Link to={to} className="text-purple-100 font-semibold hover:underline">
        {linkText}
      </Link>
    </p>
  );
}