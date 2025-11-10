import WeekBar from "./WeekBar";

export default function CardWeek({ title, description, icon: Icon, currentWeekOffset, setCurrentWeekOffset, children }) {
  return (
    <div className="bg-indigo-900 text-purple-100 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 border border-violet-400">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon />
            <h3 className="text-xl sm:text-2xl font-bold mb-1">{title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-violet-300">{description}</p>
        </div>
        <WeekBar
          currentWeekOffset={currentWeekOffset}
          setCurrentWeekOffset={setCurrentWeekOffset}
        />
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}