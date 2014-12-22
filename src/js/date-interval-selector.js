/**
 * @copyright Devexperts
 *
 * @requires DX
 * @requires DX.Dom
 * @requires DX.Date
 * @requires DX.Event
 * @requires Calendar
 * @requires Object.merge
 * @requires Object.clone
 */
var DateIntervalSelector = (function(DX, window, document, undefined) {
	'use strict';

	var dateUtil = DX.Date,
		CN_DATE_INTERVAL_SELECTOR = 'dateIntervalSelector',
		CN_CALENDAR = CN_DATE_INTERVAL_SELECTOR + '--calendar',
		CN_CALENDAR_FIRST = CN_CALENDAR + '-first',
		CN_CALENDAR_LAST = CN_CALENDAR + '-last',
		CN_CALENDAR_MONTH_DISABLED = 'calendar--month-disabled',
		CN_INPUT = CN_DATE_INTERVAL_SELECTOR + '--input',
		CN_INPUT_START = CN_INPUT + '-start',
		CN_INPUT_END = CN_INPUT + '-end',
		M_DISABLED = 'disabled',
		M_SELECTED = 'selected',
		M_CURRENT_MONTH = 'currentMonth',
		E_CLICK = DX.Event.CLICK,
		E_DAY_SELECTED = Calendar.E_DAY_SELECTED,
		configDefault = {
			monthNames: ['january', 'february', 'march', 'april', 'may', 'june',
				'july', 'august', 'september', 'october', 'november', 'december'],
			firstCalendarTmpl: [
				'<div class="calendar--info">',
				'<span class="calendar--month calendar--month-prev"></span>',
				'<span class="calendar--month calendar--month-current"></span>',
				'</div>',
				'<div class="calendar--header"></div>',
				'<div class="calendar--dates"></div>'
			].join(''),
			lastCalendarTmpl: [
				'<div class="calendar--info">',
				'<span class="calendar--month calendar--month-current"></span>',
				'<span class="calendar--month calendar--month-next"></span>',
				'</div>',
				'<div class="calendar--header"></div>',
				'<div class="calendar--dates"></div>'
			].join('')
		};

	function initElements(container) {
		return {
			container: container,
			inputSelectionStart: DX.$$('.' + CN_INPUT_START, container),
			inputSelectionEnd: DX.$$('.' + CN_INPUT_END, container)
		};
	}

	function isSelectableDate(dateObject) {
		return dateObject.modifiers.indexOf(M_DISABLED) === -1 &&
				dateObject.modifiers.indexOf(M_CURRENT_MONTH) > -1;
	}

	return function DateIntervalSelector(container, config) {
		var firstCalendar, lastCalendar, elements, currentDate, maxTimestamp, minTimestamp, selectionStart, selectionEnd;

		function init() {

			config = config ? Object.merge(configDefault, config) : configDefault;

			maxTimestamp = config.maxTimestamp || new Date().getTime();
			minTimestamp = config.minTimestamp || 0;

			elements = initElements(container);

			initAppearance();
			initDefaultCalendars();
			initListeners();
		}

		function eachCalendar(fn) {
			[firstCalendar, lastCalendar].forEach(function(calendar) {
				fn(calendar);
			});
		}
		
		function eachCalendarContainer(fn) {
			[elements.firstCalendarContainer, elements.lastCalendarContainer].forEach(function(calendarContainer) {
				fn(calendarContainer);
			});
		}

		function initListeners() {
			eachCalendarContainer(function(calendarContainer) {
				calendarContainer.addEventListener(E_CLICK, function(e) {
					calendarContainer.removeEventListener(E_DAY_SELECTED, selectOneDate);
					calendarContainer.removeEventListener(E_DAY_SELECTED, selectInterval);

					if (e.shiftKey && selectionStart) {
						shiftClickHandler(e);
					} else {
						simpleClickHandler(e);
					}
				}, true);
			});

			elements.nextMonthLabel.addEventListener(E_CLICK, drawNextMonths);
			elements.prevMonthLabel.addEventListener(E_CLICK, drawPrevMonths);
		}

		function simpleClickHandler(e) {
			eachCalendarContainer(function(calendarContainer) {
				calendarContainer.addEventListener(E_DAY_SELECTED, selectOneDate);
			});
		}

		function shiftClickHandler(e) {
			eachCalendarContainer(function(calendarContainer) {
				calendarContainer.addEventListener(E_DAY_SELECTED, selectInterval);
			});
		}

		function selectOneDate(e) {
			var dayModel = e.detail.dayModel;

			if (isSelectableDate(dayModel)) {
				selectionStart = dateUtil.clone(dayModel.date);
				selectionEnd = null;

				updateCalendars();
			}
		}

		function selectInterval(e) {
			var dayModel = e.detail.dayModel,
				selectionDate = dateUtil.clone(dayModel.date);

			if (isSelectableDate(dayModel)) {
				if (dateUtil.isGreater(selectionDate, selectionStart)) {
					selectionEnd = selectionDate;
				} else if (dateUtil.isEqual(selectionDate, selectionStart)) {
					selectionEnd = null;
				} else if (!selectionEnd) {
					selectionEnd = selectionStart;
					selectionStart = selectionDate;
				} else if (dateUtil.isLess(selectionDate, selectionStart)) {
					selectionStart = selectionDate;
				}

				updateCalendars();
			}
		}

		function updateCalendars() {
			eachCalendar(function(calendar) {
				calendar.update();
			});
			storeIntervalValues();
		}

		function drawPrevMonths() {
			eachCalendar(function(calendar) {
				calendar.drawPrevMonth();
			});

			updateMonthLabels();
		}

		function drawNextMonths() {
			eachCalendar(function(calendar) {
				calendar.drawNextMonth();
			});

			updateMonthLabels();
		}

		function initAppearance() {
			var firstCalendarConfig = Object.clone(config),
				lastCalendarConfig = Object.clone(config);

			firstCalendarConfig.tmpl = config.firstCalendarTmpl;
			lastCalendarConfig.tmpl = config.lastCalendarTmpl;

			elements.firstCalendarContainer = DX.Dom.createElement('div', {
				className: [CN_CALENDAR, CN_CALENDAR_FIRST]
			});
			elements.lastCalendarContainer = DX.Dom.createElement('div', {
				className: [CN_CALENDAR, CN_CALENDAR_LAST]
			});

			firstCalendar = new Calendar(elements.firstCalendarContainer, firstCalendarConfig);
			lastCalendar = new Calendar(elements.lastCalendarContainer, lastCalendarConfig);

			elements.prevMonthLabel = DX.$$('.calendar--month-prev', elements.firstCalendarContainer);
			elements.nextMonthLabel = DX.$$('.calendar--month-next', elements.lastCalendarContainer);

			container.appendChild(elements.firstCalendarContainer);
			container.appendChild(elements.lastCalendarContainer);
		}

		function storeIntervalValues() {
			if (selectionStart) {
				elements.inputSelectionStart.value = dateUtil.toShortISOString(selectionStart);
			} else {
				elements.inputSelectionStart.value = '';
			}

			if (selectionEnd) {
				elements.inputSelectionEnd.value = dateUtil.toShortISOString(selectionEnd);
			} else {
				elements.inputSelectionEnd.value = '';
			}
		}

		function initDefaultCalendars() {
			var date = config.dateTimestamp ? new Date(config.dateTimestamp) : new Date();

			dateUtil.setMidnight(date);

			registerProcessors();
			redrawAllByDate(date);
		}

		function registerProcessors() {
			eachCalendar(function(calendar) {
				calendar.registerProcessor(rangeProcessor);
				calendar.registerProcessor(selectionProcessor);
			});
		}

		function selectionProcessor(dateObject) {
			var date = dateObject.date;

			if (selectionStart && isSelectableDate(dateObject)) {
				if (dateUtil.isEqual(selectionStart, date)) {
					dateObject.modifiers.push(M_SELECTED);
				}
			}

			if (selectionEnd && isSelectableDate(dateObject)) {
				if ((dateUtil.isLess(date, selectionEnd) ||
						dateUtil.isEqual(date, selectionEnd)) &&
						dateUtil.isGreater(date, selectionStart)) {

					dateObject.modifiers.push(M_SELECTED);
				}
			}
		}

		function redrawAllByDate(date) {
			currentDate = date;

			date = dateUtil.clone(date);
			date.setDate(1);

			firstCalendar.drawPrevMonth(date);
			lastCalendar.drawMonth(date);

			updateMonthLabels();
		}

		function updateMonthLabels() {
			var nextMonthDate = dateUtil.incrementMonth(lastCalendar.getDate()),
				prevMonthDate = dateUtil.decrementMonth(firstCalendar.getDate());

			elements.nextMonthLabel.textContent = config.monthNames[nextMonthDate.getMonth()];
			elements.prevMonthLabel.textContent = config.monthNames[prevMonthDate.getMonth()];

			updateLabelState();
		}

		function updateLabelState() {
			var prevMonthDate = dateUtil.decrementMonth(firstCalendar.getDate()),
				nextMonthDate = dateUtil.incrementMonth(lastCalendar.getDate());

			if (dateUtil.isLessMonth(prevMonthDate, new Date(minTimestamp))) {
				elements.prevMonthLabel.classList.add(CN_CALENDAR_MONTH_DISABLED);
			} else {
				elements.prevMonthLabel.classList.remove(CN_CALENDAR_MONTH_DISABLED);
			}

			if (dateUtil.isGreaterMonth(nextMonthDate, new Date(maxTimestamp))) {
				elements.nextMonthLabel.classList.add(CN_CALENDAR_MONTH_DISABLED);
			} else {
				elements.nextMonthLabel.classList.remove(CN_CALENDAR_MONTH_DISABLED);
			}
		}

		function rangeProcessor(dateObject) {
			if (dateObject.date.getTime() < minTimestamp ||
					dateObject.date.getTime() > maxTimestamp) {

				dateObject.modifiers.push(M_DISABLED);
			}
		}

		init();
	};
})(DX, window, document);