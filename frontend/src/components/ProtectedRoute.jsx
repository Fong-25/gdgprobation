import { useNavigate } from "react-router-dom";
import { useContext, createContext, useEffect, useState } from "react";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export default function ProtectedRoute({ children }) {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState(null);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const verifyUser = async () => {
			try {
				const res = await fetch(
					`${import.meta.env.VITE_API_URL}/api/dashboard`,
					{
						method: "GET",
						credentials: "include",
					}
				);
				if (res.ok) {
					const data = await res.json();
					setUser(data.user);
					setIsAuthenticated(true);
				} else {
					setIsAuthenticated(false);
				}
			} catch (error) {
				setIsAuthenticated(false);
			}
		};
		verifyUser();
	}, []);

	useEffect(() => {
		if (isAuthenticated === false) {
			navigate("/login");
		}
	}, [isAuthenticated, navigate]);

	if (isAuthenticated === null) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}
	if (!isAuthenticated) {
		// navigate('/login')
		return null;
	}
	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
}
