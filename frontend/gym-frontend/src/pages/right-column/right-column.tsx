import './right-column.scss';
import Calendar from '../../shared/ui/calendar/calendar';
import { calendarDateStore } from '../../shared/ui/calendar/calendarDataStore';

const RightColumn = ({ showCalendar = false }) => {
    if (showCalendar) {
        const setSelectedDate = calendarDateStore((state: any) => state.setSelectedDate);
        return (<main className="right-column">
           <Calendar
            trainingDays={["2026-05-10", "2026-05-12", "2026-05-15"]}
            onDaySelect={(d) => setSelectedDate(d) }
           />
        </main>);
    }
    else {
        return (<main className="right-column"></main>);
    }
};

export default RightColumn;
