import React, { useState, useMemo } from 'react';
import './calendar.scss';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickerDay, PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import type { MuiEvent } from '@mui/x-internals/types';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';

type TrainingDayProps = PickerDayProps & {
  highlightedDays?: Set<string>;
  myOnDaySelect?: (dateIso: string) => void;
};

function TrainingDay(props: TrainingDayProps) {
  const { day, highlightedDays, myOnDaySelect, ...other } = props;
  const iso = format(day as Date, 'yyyy-MM-dd');
  const hasTraining = highlightedDays?.has(iso);

  return (
    <PickerDay
		{...(other as PickerDayProps)}
		day={day}
		onClick={(event: React.MouseEvent) => {
			(other as any).onClick?.(event as unknown as MuiEvent<React.MouseEvent<HTMLButtonElement>>);
			if (hasTraining) myOnDaySelect?.(iso);
		}}
		sx={
			hasTraining
			? { bgcolor: 'hsla(104, 68%, 67%, 0.6)', color: 'balck' } // зелёный
			: undefined
		}
    />
  );
}

type CalendarProps = {
	trainingDays?: string[];
	onDaySelect?: (dateIso: string) => void;
};

const Calendar: React.FC<CalendarProps> = ({ trainingDays = [], onDaySelect}) => {
	const [value, setValue] = useState<Date | null>(new Date());
	const trainingSet = useMemo(() => new Set(trainingDays.map(d => d)), [trainingDays]);

	return (
		<div className="calendar">
			<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
				<DateCalendar 
					value={value} 
					slots={{ day: TrainingDay }}
					slotProps={{
						day: {
							highlightedDays: trainingSet,
							myOnDaySelect: onDaySelect,
						} as any,
					}}
				/>
			</LocalizationProvider>
		</div>
	);
};

export default Calendar;
