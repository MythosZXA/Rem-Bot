const { secsToMidnight } = require('./specialDaysFunctions.js');

function setupResetTimer(rem) {
	// Setup reset timer if the day hasn't reset
	if (secsToMidnight() >= ((60 * 60 * 2))) {
		setTimeout(() => {
			const dayOfWeek = new Date().getDay();
	
			rem.remDB.get('palia_gifts').forEach(giftInfo => {
				// Reset daily
				giftInfo['gifted'] = 0;
	
				// Reset weekly if sunday
				if (dayOfWeek === 0) {
					giftInfo['gift1'] = 0;
					giftInfo['gift2'] = 0;
					giftInfo['gift3'] = 0;
					giftInfo['gift4'] = 0;
				}
			});
		}, secsToMidnight() - (60 * 60 * 2)); // Two hours before midnight CST (9pm PST)
	}
	// Setup reset timer when tomorrow comes
	else {
		setTimeout(() => {
			setupResetTimer(rem);
		}, secsToMidnight() + 60)
	}
}

module.exports = {
	setupResetTimer
};