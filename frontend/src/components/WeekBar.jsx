import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconButton from './IconButton';

const getWeekDates = (offset) => {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(
    today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + offset * 7
  );

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date);
  }
  return weekDates;
};

const getWeekRange = (weekDates) => {
  const start = weekDates[0];
  const end = weekDates[6];
  const options = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;
};

// WeekRange display component that shows the current week or a link to jump to the current week
function WeekRangeDisplay({ weekDates, isCurrentWeek, setCurrentWeekOffset }) {
  const weekRange = getWeekRange(weekDates);

  return (
    <div className="text-center flex-1 sm:flex-none min-w-0 sm:min-w-[200px] lg:min-w-[220px]">
      <div className="text-xs sm:text-sm font-semibold text-purple-100 truncate">
        {weekRange}
      </div>
      {isCurrentWeek ? (
        <span className="text-[10px] sm:text-xs text-violet-300 font-medium">
          Current Week
        </span>
      ) : (
        <button
          onClick={() => setCurrentWeekOffset(0)}
          className="text-[10px] sm:text-xs text-violet-300 font-medium hover:text-purple-100 underline"
        >
          Jump to current week
        </button>
      )}
    </div>
  );
}

// Main WeekBar component
export default function WeekBar({ currentWeekOffset, setCurrentWeekOffset }) {
  const weekDates = getWeekDates(currentWeekOffset);
  const isCurrentWeek = currentWeekOffset === 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-indigo-900 px-2 sm:px-4 py-2 rounded border border-violet-400 w-full sm:w-auto">
      <IconButton
        onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
        icon={ChevronLeft}
        title="Previous week"
				hasBorder={false}
      />
      <WeekRangeDisplay
        weekDates={weekDates}
        isCurrentWeek={isCurrentWeek}
        setCurrentWeekOffset={setCurrentWeekOffset}
      />
      <IconButton
        onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
        icon={ChevronRight}
        title="Next week"
				hasBorder={false}
      />
    </div>
  );
}
