import React, { useState } from 'react';
import './calendar.scss';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

type CalendarProps = {
	trainingDays?: string[];
	onDaySelect?: (dateIso: string) => void;
	locale?: string;
};

const Calendar: React.FC<CalendarProps> = ({ trainingDays = [], onDaySelect, locale = 'ru' }) => {
	const [value, setValue] = useState<Date | null>(new Date());

	const handleChange = (newValue: Date | null) => {
		setValue(newValue);
		if (newValue && onDaySelect) {
			const iso = newValue.toISOString().slice(0, 10);
			onDaySelect(iso);
		}
	};

	return (
		<div className="calendar">
			<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
				<DatePicker
					value={value}
					onChange={handleChange}
					slotProps={{ textField: { size: 'small' } }}
				/>
			</LocalizationProvider>
		</div>
	);
};

export default Calendar;
