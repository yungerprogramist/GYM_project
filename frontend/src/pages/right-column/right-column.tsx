import './right-column.scss'
import Calendar from '../../widgets/calendar/calendar'
import { useDateStore } from './selectedDay'

const RightColumn = ({ showCalendar = false }) => {
    const setSelectedDateISO = useDateStore((state => state.setSelectedDateISO))

    if (showCalendar) {
        return (<main className="right-column">
           <Calendar
            trainingDays={["2026-05-10", "2026-05-12", "2026-05-15"]}
            onDaySelect={(d) => {
                setSelectedDateISO(d)
            }}
           />
        </main>);
    }
    else {
        return (<main className="right-column"></main>);
    }
};

export default RightColumn;
