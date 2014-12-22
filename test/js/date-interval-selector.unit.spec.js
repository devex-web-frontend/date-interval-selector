describe('Selectbox ', function() {
	var simpleTmpl = [
		'<div id="test" class="dateIntervalSelector">',
			'<input type="text" class="dateIntervalSelector--input dateIntervalSelector--input-start">',
			'<input type="text" class="dateIntervalSelector--input dateIntervalSelector--input-end">',
		'</div>'].join('');

	beforeEach(function() {
		document.body.innerHTML = simpleTmpl;
	});

	afterEach(function() {
		document.body.innerHTML = '';
	});

	describe('#constructor', function() {

		it('should add DateIntervalSelector controls into target element', function() {
			var targetElement = document.getElementById('test');

			new DateIntervalSelector(targetElement);

			expect(targetElement.querySelectorAll('.dateIntervalSelector--calendar-first').length).toBe(1);
			expect(targetElement.querySelectorAll('.dateIntervalSelector--calendar-last').length).toBe(1);
		});
	});
});