import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";

// Importing pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Logs from "./pages/Logs";
import { Toaster } from "react-hot-toast";

// Importing form components
import ThoughtsForm from "./components/ThoughtsForm";
import MoodsForm from "./components/MoodsForm";
import HabitsForm from "./components/HabitsForm";

// Importing data components
import ThoughtsData from "./components/ThoughtsData";
import MoodsData from "./components/MoodsData";
import HabitsData from "./components/HabitsData";
import ThoughtsLogs from "./components/ThoughtsLogs";
import HabitsLogs from "./components/HabitsLogs";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
	return (
		<div>
			<Toaster position="top-right" />
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/dashboard" element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}>
						<Route
							index
							element={<Navigate to="/dashboard/thoughts" replace />}
						/>
						<Route path="thoughts" element={<ThoughtsData />} />
						<Route path="moods" element={<MoodsData />} />
						<Route path="habits" element={<HabitsData />} />
					</Route>
					<Route path="/logs" element={
						<ProtectedRoute>
							<Logs />
						</ProtectedRoute>
					}>
						<Route index element={<Navigate to="/logs/thoughts" replace />} />
						<Route path="thoughts" element={<ThoughtsLogs />} />
						<Route path="moods" element={<MoodsForm />} />
						<Route path="habits" element={<HabitsLogs />} />
					</Route>
					<Route path="/home" element={
						<ProtectedRoute >
							<Home />
						</ProtectedRoute>
					}
					/>
					<Route path="/" element={
						<ProtectedRoute >
							<Home />
						</ProtectedRoute>
					} />
				</Routes>
			</Router>
		</div>
	);
}
