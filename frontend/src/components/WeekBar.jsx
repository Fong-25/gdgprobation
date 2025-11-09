import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconButton from './IconButton';

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

function WeekRangeDisplay({ weekDates, isCurrentWeek, setCurrentWeekOffset }) {
  const weekRange = getWeekRange(weekDates);

  return (
    <div className="text-purple-300 text-center flex-1 sm:flex-none min-w-0 sm:min-w-[200px] lg:min-w-[220px]">
      <div className="text-xs sm:text-sm font-semibold text-purple-100 truncate">
        {weekRange}
      </div>
      {isCurrentWeek ? (
        <span className="text-[10px] sm:text-xs  font-medium">
          Current Week
        </span>
      ) : (
        <button
          onClick={() => setCurrentWeekOffset(0)}
          className="text-[10px] sm:text-xs font-medium hover:text-purple-100 underline"
        >
          Jump to current week
        </button>
      )}
    </div>
  );
}

export const getWeekRange = (weekDates) => {
  const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const year = weekDates[6].getFullYear();

  return `${start} - ${end}, ${year}`;
};

export const getWeekDates = (offset) => {
  const today = new Date();
  const currentDay = today.getDay();

  const monday = new Date(today);
  monday.setDate(
    today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + offset * 7
  );

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
};
