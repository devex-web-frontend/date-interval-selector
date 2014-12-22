angular.scenario.dsl('modifiedClick', function() {
	return function(selector, params) {
		return this.addFutureAction('click with modification key pressed', function($window, $document, done) {
			var element = $document.find(selector).get(0),
				event = new MouseEvent('click', {
					shiftKey: params && !!params.shift,
					altKey: params && !!params.alt,
					ctrlKey: params && !!params.ctrl,
					bubbles: true
				});

			function clickHandler() {
				element.removeEventListener('click', clickHandler);
				done();
			}
			element.addEventListener('click', clickHandler);
			element.dispatchEvent(event);
		});
	};
});