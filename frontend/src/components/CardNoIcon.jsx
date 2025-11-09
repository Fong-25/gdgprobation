export default function CardNoIcon({ value, label }) {
  return (
    <div className="bg-indigo-900 rounded-lg border border-violet-400 p-3 sm:p-4 text-center">
      <div className="text-xl sm:text-2xl font-bold text-purple-100">{value}</div>
      <div className="text-xs sm:text-sm text-violet-300">{label}</div>
    </div>
  );
}