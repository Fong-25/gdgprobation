"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			console.log("API URL:", import.meta.env.VITE_API_URL);
			console.log("Environment:", import.meta.env.MODE);
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/auth/login`,
				{
					method: "POST",
					credentials: "include", // important for JWT cookies
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				}
			);

			const data = await res.json();

			if (res.ok) {
				toast.success("Login successful!");
				navigate("/dashboard");
			} else {
				toast.error(data.message || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md">
				<div className="bg-card border border-border rounded-lg shadow-lg p-8">
					<div className="flex items-center justify-center mb-8">
						<div className="bg-primary/10 p-3 rounded-full">
							<LogIn className="w-8 h-8 text-primary" />
						</div>
					</div>

					<h1 className="text-3xl font-bold text-center mb-2 text-foreground">
						Welcome Back
					</h1>
					<p className="text-center text-muted-foreground mb-8">
						Sign in to your account to continue
					</p>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-foreground mb-2"
							>
								Username
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
								<input
									id="username"
									name="username"
									type="username"
									value={formData.username}
									onChange={handleChange}
									disabled={isLoading}
									className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
									placeholder="johndoe"
									autoComplete="off"
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-foreground mb-2"
							>
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={handleChange}
									disabled={isLoading}
									className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
									placeholder="••••••••"
									autoComplete="off"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-foreground text-background py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</button>
					</form>

					<p className="text-center mt-6 text-sm text-foreground">
						Don't have an account?{" "}
						<Link
							to="/signup"
							className="text-primary font-semibold hover:underline"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
