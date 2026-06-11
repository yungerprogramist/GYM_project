import './right-column.scss'
import Calendar from '../../widgets/calendar/calendar'
import { useDateStore } from './selectedDay'

// для включения календаря:
// const setShowCalendar = useDateStore((state) => state.setShowCalendar);

// useEffect(() => {
//     setShowCalendar(true);
    
//     // Сбрасываем при уходе со страницы
//     return () => {
//     setShowCalendar(false);
//     };
// }, [setShowCalendar]);

const RightColumn = () => {
    const setSelectedDateISO = useDateStore((state => state.setSelectedDateISO))
    const showCalendar = useDateStore(state => state.showCalendar)

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
