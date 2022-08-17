// api				https://developer.twitter.com/en/docs/twitter-api

// enable environment variables
require('dotenv').config();
const request = require('request');
const get = require('util').promisify(request.get);
// request auth
const oAuthConfig = {
	consumer_key: process.env.twitterAPIK,
	consumer_secret: process.env.twitterAPIKS,
	token: process.env.twitterAT,
	token_secret: process.env.twitterATS,
};
// globals
let tweetURL = ['https:', '', 'twitter.com', '', 'status', ''];
const twitterHandlers = ['GrandChaseG', 'playlostark', 'HoloCureGame'];
const currentTweets = new Map();

/**
 * It checks for new tweets every 30 seconds and sends them to a Discord channel
 * @param channels - a Map of all the channels in the server
 */
async function checkNewTweets(channels) {
	const tweetChannel = channels.get('tweets');
	await getCurrentTweets(tweetChannel);

	// setInterval(() => {
	// 	currentTweets.forEach(async (currentTweet, twitterHandle) => {
	// 		// get timestamps of current/latest tweets
	// 		const currentTweetTimestamp = new Date(currentTweet.created_at);
	// 		const latestTweet = await getUserLatestTweet(twitterHandle);
	// 		const latestTweetTimestamp = new Date(latestTweet.created_at);
	// 		// send & save latest tweet if it's newer than current tweet
	// 		if (currentTweetTimestamp.getTime() < latestTweetTimestamp.getTime()) {
	// 			// build tweet URL
	// 			tweetURL.splice(3, 1, twitterHandle);
	// 			tweetURL.splice(5, 1, latestTweet.id);
	// 			tweetChannel.send(tweetURL.join('/'));
	// 			// send tweet to channel
	// 			currentTweets.set(twitterHandle, latestTweet);
	// 		}
	// 	});
	// }, 1000 * 60 * 30);
}

/**
 * It fetches the latest 50 messages from a Discord channel, extracts the tweet ID from
 * the latest message for each handler, and then sends a request to the Twitter API to get the tweet's
 * data to store in the Map
 * @param tweetChannel - the channel where the bot will post the tweets
 */
async function getCurrentTweets(tweetChannel) {
	const channelMessages = await tweetChannel.messages.fetch({ limit: 50 });

	twitterHandlers.forEach(async twitterHandle => {
		const currentMessage = channelMessages.find(message => message.content.split('/')[3] === twitterHandle);
		const currentTweetID = currentMessage.content.split('/')[5];
		const endpointURL = new URL(`https://api.twitter.com/2/tweets/${currentTweetID}`);
		const params = {
			'tweet.fields': 'created_at'
		};
		// send request
		const requestResponse = await get({ url: endpointURL, oauth: oAuthConfig, qs: params, json: true });
		if (requestResponse.body.title === 'UsageCapExceeded') {		// api limit, exit
			return;
		} else if (requestResponse.body) {
			const latestTweet = requestResponse.body.data;
			currentTweets.set(twitterHandle, latestTweet);
		} else {
			throw new Error('Could not get the current tweet');
		}
	});
}

async function getUserLatestTweet(twitterHandle) {
	const twitterUserID = await getTwitterUserID(twitterHandle);
	const endpointURL = new URL(`https://api.twitter.com/2/users/${twitterUserID}/tweets`);
	const params = {
		'exclude': 'retweets,replies',
		'tweet.fields': 'created_at'
	};

	// send request
	const requestResponse = await get({ url: endpointURL, oauth: oAuthConfig, qs: params, json: true });
	if (requestResponse.body.title === 'UsageCapExceeded') {		// api limit, exit
		return;
	} else if (requestResponse.body) {
		const latestTweet = requestResponse.body.data[0];
		return latestTweet;
	} else {
		throw new Error('Could not get the latest tweet');
	}
}

/**
 * It takes a Twitter handle as an argument, and returns the Twitter user ID of that handle
 * @param twitterHandle - the Twitter handle of the user you want to get the ID for
 * @returns the Twitter User ID
 */
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