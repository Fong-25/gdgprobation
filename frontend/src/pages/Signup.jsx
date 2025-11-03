"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUp() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/auth/signup`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						username: formData.username,
						email: formData.email,
						password: formData.password,
					}),
				}
			);

			const data = await res.json();
			if (res.ok) {
				toast.success("Account created successfully!");
				navigate("/login");
			} else {
				toast.error(data.message || "Signup failed");
			}
		} catch (error) {
			console.error("Signup error:", error);
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md">
				<div className="bg-card border border-border rounded-lg shadow-lg p-6">
					<div className="flex items-center justify-center mb-6">
						<div className="bg-primary/10 p-3 rounded-full">
							<UserPlus className="w-8 h-8 text-primary" />
						</div>
					</div>

					<h1 className="text-3xl font-bold text-center mb-1 text-foreground">
						Create Account
					</h1>
					<p className="text-center text-muted-foreground mb-6">
						Sign up to start tracking your expenses
					</p>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-foreground mb-1.5"
							>
								Username
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
								<input
									id="username"
									name="username"
									type="text"
									value={formData.username}
									onChange={handleChange}
									disabled={isLoading}
									className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
									placeholder="johndoe"
									autoComplete="off"
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-foreground mb-1.5"
							>
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
								<input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
									disabled={isLoading}
									className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
									placeholder="you@example.com"
									autoComplete="off"
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-foreground mb-1.5"
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
									className="w-full pl-10 pr-12 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-foreground mb-2"
							>
								Confirm Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									value={formData.confirmPassword}
									onChange={handleChange}
									disabled={isLoading}
									className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
									placeholder="••••••••"
									required
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									disabled={isLoading}
								>
									{showConfirmPassword ? (
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
									Creating account...
								</>
							) : (
								"Create Account"
							)}
						</button>
					</form>

					<p className="text-center mt-6 text-sm text-foreground">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-primary font-semibold hover:underline"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
