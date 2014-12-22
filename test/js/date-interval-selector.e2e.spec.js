describe('DateIntervalSelector', function() {
	var months = ['january', 'february', 'march', 'april', 'may', 'june',
		'july', 'august', 'september', 'october', 'november', 'december'];

	describe('with simple template', function() {
		beforeEach(function() {
			browser().navigateTo('/test/js/html/simple.html');
		});

		afterEach(function() {
			browser().navigateTo('');
		});
		it('should generate previous and current months by default', function() {
			var date = new Date(),
				currentMonth = months[date.getMonth()],
				prevMonth;

			date.setMonth(date.getMonth() - 1);
			prevMonth = months[date.getMonth()];

			expect(element('.dateIntervalSelector--calendar-first .calendar--month-current').text()).toBe(prevMonth);
			expect(element('.dateIntervalSelector--calendar-last .calendar--month-current').text()).toBe(currentMonth);
		});
	});

	describe('with predefined templates', function() {
		beforeEach(function() {
			browser().navigateTo('/test/js/html/predefined.html');
		});

		afterEach(function() {
			browser().navigateTo('');
		});

		describe('monthSwitchers', function() {
			it('should add name of next month to .calendar--month-next', function() {
				expect(element('.calendar--month-next').text()).toBe('march');
			});

			it('should add name of previous month to .calendar--month-prev', function() {
				expect(element('.calendar--month-prev').text()).toBe('december');
			});

			it('should draw previous months when user click on .calendar--month-prev', function() {
				element('.calendar--month-prev').click();

				expect(element('.calendar--month-prev').text()).toBe('november');
				expect(element('.calendar--month-current:first').text()).toBe('december');
				expect(element('.calendar--month-current:last').text()).toBe('january');
				expect(element('.calendar--month-next').text()).toBe('february');
			});

			it('should draw next months when user click on .calendar--month-next', function() {
				element('.calendar--month-next').click();

				expect(element('.calendar--month-prev').text()).toBe('january');
				expect(element('.calendar--month-current:first').text()).toBe('february');
				expect(element('.calendar--month-current:last').text()).toBe('march');
				expect(element('.calendar--month-next').text()).toBe('april');
			});

			it('should add -disabled modifier to dates that not in provided to range', function() {
				expect(element('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day-disabled').count()).toBe(16);
			});

			it('should add -disabled modifier to .calendar--month-next if next month not available for selection', function() {
				expect(element('.calendar--month-next.calendar--month-disabled').count()).toBe(1)
			});

			it('should add -disabled modifier to .calendar--month-prev if previous month not available for selection', function() {
				element('.calendar--month-prev').click();

				expect(element('.calendar--month-prev.calendar--month-disabled').count()).toBe(1);
			});
		});

		describe('selection', function() {
			it('should select date on click', function() {
				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(15)').click();
				sleep(0.1);

				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').count()).toBe(1);
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').text()).toBe('15');
			});

			it('should select one date if clicked on date with shift modifier and no other date selected', function() {
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(15)', {shift:true});
				sleep(0.1);

				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').count()).toBe(1);
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').text()).toBe('15');
			});

			it('should select interval if already has selected date and shift+click on other date happens', function() {
				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(15)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(20)', {shift:true});
				sleep(0.05);

				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').count()).toBe(6);
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:first').text()).toBe('15');
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:last').text()).toBe('20');
			});

			it('should select interval even shift+click happened on date before already selected', function() {
				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(20)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(14)', {shift:true});
				sleep(0.05);

				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').count()).toBe(7);
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:first').text()).toBe('14');
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:last').text()).toBe('20');
			});

			it('should append dates if shift+click happened on date after already selected interval', function() {
				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(15)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(20)', {shift:true});
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(21)', {shift:true});
				sleep(0.05);

				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').count()).toBe(7);
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:first').text()).toBe('15');
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:last').text()).toBe('21');
			});

			it('should prepend dates if shift+click happened on date before already selected interval', function() {
				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(15)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(20)', {shift:true});
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(14)', {shift:true});
				sleep(0.05);

				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected').count()).toBe(7);
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:first').text()).toBe('14');
				expect(element('.dateIntervalSelector--calendar-first .calendar--day-selected:last').text()).toBe('20');
			});

			it('should not select date if clicked on disabled date', function() {
				element('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(20)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(11)', {shift:true});
				sleep(0.05);

				expect(element('.calendar--day-selected').count()).toBe(1);
			});

			it('should not select date of clicked on dates of next or previous months', function() {
				element('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(10)').click();
				sleep(0.05);

				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day-prevMonth:first', {shift:true});
				sleep(0.05);
				expect(element('.calendar--day-selected').count()).toBe(1);

				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day-nextMonth:first', {shift:true});
				sleep(0.05);
				expect(element('.calendar--day-selected').count()).toBe(1);
			});

			it('should not change interval if clicked on disabled date', function() {
				element('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(10)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(15)', {shift:true});
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(20)', {shift:true});
				sleep(0.05);

				expect(element('.calendar--day-selected').count()).toBe(6);
			});

			it('should not change interval if clicked on on dates of next or previous months', function() {
				element('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(10)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day:nth-child(15)', {shift:true});
				sleep(0.05);

				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day-prevMonth:first', {shift:true});
				sleep(0.05);
				expect(element('.calendar--day-selected').count()).toBe(6);

				modifiedClick('.dateIntervalSelector--calendar-last .calendar--dates .calendar--day-nextMonth:first', {shift:true});
				sleep(0.05);
				expect(element('.calendar--day-selected').count()).toBe(6);
			});

			it('should write selected date to .dateIntervalSelector--input-start as short ISO string', function() {
				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(10)').click();
				sleep(0.05);

				expect(element('.dateIntervalSelector--input-start').val()).toBe('2012-01-10');
			});

			it('should write first date of interval to .dateIntervalSelector--input-start' +
				'and last date of interval to .dateIntervalSelector--input-end as short ISO strings', function() {

				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(10)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(15)', {shift:true});
				sleep(0.05);

				expect(element('.dateIntervalSelector--input-start').val()).toBe('2012-01-10');
				expect(element('.dateIntervalSelector--input-end').val()).toBe('2012-01-15');
			});

			it('should write empty string to .dateIntervalSelector--input-end if selected only one date', function() {
				element('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(10)').click();
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(15)', {shift:true});
				sleep(0.05);
				modifiedClick('.dateIntervalSelector--calendar-first .calendar--dates .calendar--day:nth-child(10)', {shift:true});
				sleep(0.05);

				expect(element('.dateIntervalSelector--input-start').val()).toBe('2012-01-10');
				expect(element('.dateIntervalSelector--input-end').val()).toBe('');
			});
		});
	});

});