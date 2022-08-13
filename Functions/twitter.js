// enable environment variables
require('dotenv').config();
const request = require('request');
const get = require('util').promisify(request.get);

const oAuthConfig = {
	consumer_key: process.env.twitterAPIK,
	consumer_secret: process.env.twitterAPIKS,
	token: process.env.twitterAT,
	token_secret: process.env.twitterATS,
};

let tweetURL = ['https:', '', 'twitter.com', '', 'status', ''];
const twitterHandlers = ['GrandChaseG', 'playlostark', 'HoloCureGame'];
const latestTweetsID = new Map();

async function checkNewTweets(rem) {
	await getCurrentTweets(rem);

	setInterval(() => {
		latestTweetsID.forEach(async (tweetID, twitterHandle) => {
			const latestTweetID = await getUserLatestTweetID(twitterHandle);
			if (tweetID !== latestTweetID) {
				const tweetChannel = rem.channels.cache.find(channel => channel.name === 'tweets');
				tweetURL.splice(3, 1, twitterHandle);
				tweetURL.splice(5, 1, latestTweetID);
				tweetChannel.send(tweetURL.join('/'));

				latestTweetsID.set(twitterHandle, latestTweetID);
			}
		});
	}, 1000 * 30);
}

async function getCurrentTweets(rem) {
	const twitterChannel = rem.channels.cache.find(channel => channel.name === 'tweets');
	const channelMessages = await twitterChannel.messages.fetch({ limit: 50 });

	twitterHandlers.forEach(twitterHandle => {
		const latestMessage = channelMessages.find(message => message.content.split('/')[3] === twitterHandle);
		const latestTweetID = latestMessage.content.split('/')[5];
		latestTweetsID.set(twitterHandle, latestTweetID);
	});
}

async function getUserLatestTweetID(twitterHandle) {
	const twitterUserID = await getTwitterUserID(twitterHandle);
	const endpointURL = new URL(`https://api.twitter.com/2/users/${twitterUserID}/tweets`);
	const params = {
		'exclude': 'retweets,replies'
	};

	// send request
	const requestResponse = await get({ url: endpointURL, oauth: oAuthConfig, qs: params, json: true });
	if (requestResponse.body) {
		const tweetID = requestResponse.body.data[0].id;
		return tweetID;
	} else {
		throw new Error('Could not get the latest tweet');
	}
}

async function getTwitterUserID(twitterHandle) {
	const endpointURL = new URL(`https://api.twitter.com/2/users/by/username/${twitterHandle}`);

	// send request
	const requestResponse = await get({ url: endpointURL, oauth: oAuthConfig, json: true });
	if (requestResponse.body) {
		const twitterUserID = requestResponse.body.data.id;
		return twitterUserID;
	} else {
		throw new Error(`Could not get/find the user ${twitterHandle}`);
	}
}

module.exports = {
	checkNewTweets
};