const { secsToMidnight } = require('./specialDaysFunctions.js');

function setupResetTimer(rem) {
	setTimeout(() => {
		const dayOfWeek = new Date().getDay();

		rem.remDB.get('palia_gifts').forEach(giftInfo => {
			giftInfo['gifted'] = 0;
			if (dayOfWeek === 0) {
				giftInfo['gift1'] = 0;
				giftInfo['gift2'] = 0;
				giftInfo['gift3'] = 0;
				giftInfo['gift4'] = 0;
			}
		});
	}, secsToMidnight() - (1000 * 60 * 60));
}

module.exports = {
	setupResetTimer
};