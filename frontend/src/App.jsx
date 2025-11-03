import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importing pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Logs from "./pages/Logs";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
	return (
		<div>
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route
						path="/dashboard"
						element={
							//<ProtectedRoute>
							<Dashboard />
							//</ProtectedRoute>
						}
					/>
					<Route
						path="/logs"
						element={
							//<ProtectedRoute>
							<Logs />
							//</ProtectedRoute>
						}
					/>
					<Route
						path="/home"
						element={
							//<ProtectedRoute>
							<Home />
							//</ProtectedRoute>
						}
					/>
				</Routes>
			</Router>
		</div>
	);
}
