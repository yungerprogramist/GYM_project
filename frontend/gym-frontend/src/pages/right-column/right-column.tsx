import './right-column.scss';
import Calendar from '../../shared/ui/calendar/calendar';

const RightColumn = () => {
  return (
    <main className="right-column">
      <Calendar
        trainingDays={["2024-03-10", "2024-03-12", "2024-03-15"]}
        onDaySelect={(d) => console.log('selected day', d)}
      />
    </main>
  );
};

export default RightColumn;
