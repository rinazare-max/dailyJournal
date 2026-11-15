/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["com/dailyjournal/dailyjournal/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
