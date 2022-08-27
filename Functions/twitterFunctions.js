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

async function checkForNewTweets(remDB, channels) {
	// const tweets = remDB.get('tweets');
	// setInterval(() => {
	// 	tweets.forEach(tweet => {
	// 		const latestTweet = getUserLatestTweet(tweet.twitter_handle);
	// 		const latestTweetTimestamp = new Date(latestTweet.created_at);
	// 		const currentTweetTimestamp = new Date(tweet.created_at);
	// 		if (currentTweetTimestamp.getTime() < latestTweetTimestamp.getTime()) {
	// 			// build tweet URL
	// 			tweetURL.splice(3, 1, tweet.twitter_handle);
	// 			tweetURL.splice(5, 1, latestTweet.id);
	// 			// send tweet to channel
	// 			const tweetChannel = channels.get('tweets');
	// 			tweetChannel.send(tweetURL.join('/'));
	// 			// replace tweet data in db
	// 			tweet.tweet_id = latestTweet.id;
	// 			tweet.created_at = latestTweet.created_at;
	// 			tweet.user_id = latestTweet.author_id;
	// 		}
	// 	});
	// }, 1000 * 60 * 30);
}

/**
 * It gets the latest tweet of a user
 * @param twitterHandle - The twitter handle of the user you want to get the latest tweet from
 * @returns The latest tweet from the user
 */
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
	tweetURL,
	checkForNewTweets,
	getUserLatestTweet
};