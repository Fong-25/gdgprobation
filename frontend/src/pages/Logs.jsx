import { useState } from "react";
import Header from "../components/Header";
import { toast } from "react-hot-toast";
import { MessageSquare, Heart, CheckSquare } from "lucide-react";
import { SidebarProvider } from "../contexts/SidebarContext";
import MoodGrid from "../components/MoodGrid";

export default function Logs() {
  return (
    <SidebarProvider>
      <div>
        <Header />
        <main className="flex-1 p-4 sm:p-6 w-full min-w-0 mx-auto bg-indigo-900">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-purple-100">Add New Entries</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-7xl m-auto p-4 sm:p-6 lg:p-8">
            <ThoughtForm />
            <HabitForm />
            <div className="bg-indigo-900 rounded-lg border border-violet-400 p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-100" />
                <h3 className="text-xl sm:text-2xl font-bold text-purple-100">Log Mood</h3>
              </div>
              <p className="text-xs sm:text-sm text-violet-300 mb-4">Click anywhere on the grid to log your current mood</p>

              <MoodGrid />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function useApiFormSubmit(endpoint, initialData, entityName) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleDataChange = (e, customValue) => {
    const { name, value } = e.target;
    const newValue = customValue !== undefined ? customValue : value;

    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleDataSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = { message: text };
      }

      if (res.ok) {
        toast.success(`${entityName} added successfully!`);
        // Reset form data to initial state
        setFormData(initialData);
      } else {
        toast.error(data.message || `Adding ${entityName.toLowerCase()} failed`);
      }
    } catch (error) {
      console.error(`Adding ${entityName.toLowerCase()} error:`, error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return { formData, submitting, handleDataChange, handleDataSubmit };
}

function ThoughtForm() {
  const initialThoughtData = { text: "" };
  const {
    formData,
    submitting,
    handleDataChange,
    handleDataSubmit
  } = useApiFormSubmit("/api/thoughts", initialThoughtData, "Thought");

  const handleThoughtChange = (e) => {
    const { value, name } = e.target;
    let newValue = value;

    if (name === "text") {
      const words = value.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length > 5) {
        newValue = words.slice(0, 5).join(" ");
        toast.error("Maximum 5 words allowed");
      }
    }

    handleDataChange(e, newValue);
  };

  return (
    <FormCard
      icon={MessageSquare}
      title="Add Thought"
      description="Share your thoughts (maximum 5 words)"
      submitting={submitting}
      submitText="Add Thought"
      handleSubmit={handleDataSubmit}
    >
      <FormInput
        name="text"
        value={formData.text}
        onChange={handleThoughtChange}
        placeholder="Enter your thought"
        disabled={submitting}
      />
    </FormCard>
  );
}

function HabitForm() {
  const initialHabitData = { name: "" };
  const {
    formData,
    submitting,
    handleDataChange,
    handleDataSubmit
  } = useApiFormSubmit("/api/habits", initialHabitData, "Habit");

  return (
    <FormCard
      icon={CheckSquare}
      title="Add Habit"
      description="Create a new habit to track"
      submitting={submitting}
      submitText="Add Habit"
      handleSubmit={handleDataSubmit}
    >
      <FormInput
        name="name"
        value={formData.name}
        onChange={handleDataChange}
        placeholder="Enter habit name"
        disabled={submitting}
      />
    </FormCard>
  );
}

function FormCard({ icon: Icon, title, description, children, submitting, submitText, handleSubmit }) {
  return (
    <div className="bg-indigo-900 rounded-lg border border-violet-400 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-100" />
        <h3 className="text-xl sm:text-2xl font-bold text-purple-100">{title}</h3>
      </div>
      <p className="text-xs sm:text-sm text-violet-300 mb-4">{description}</p>

      <form onSubmit={handleSubmit}>
        {children}
        <FormButton submitting={submitting} submitText={submitText} />
      </form>
    </div>
  );
}

function FormInput({ name, value, onChange, placeholder, disabled }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-violet-600 w-full px-3 py-2 border border-violet-400 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
        disabled={disabled}
      />
    </div>
  );
}

function FormButton({ submitting, submitText }) {
  return (
    <button
      type="submit"
      className="w-full px-4 py-2 bg-indigo-950 text-purple-100 rounded hover:bg-violet-950 disabled:bg-black disabled:cursor-not-allowed"
      disabled={submitting}
    >
      {submitting ? "Adding..." : submitText}
    </button>
  );
}

