import './right-column.scss';
import Calendar from '../../shared/ui/calendar/calendar';

const RightColumn = ({ showCalendar = false }) => {
    if (showCalendar) {
        return (<main className="right-column">
           <Calendar
            trainingDays={["2026-05-10", "2026-05-12", "2026-05-15"]}
            onDaySelect={(d) => localStorage.setItem('selectedDate', d) }
           />
        </main>);
    }
    else {
        return (<main className="right-column"></main>);
    }
};

export default RightColumn;
