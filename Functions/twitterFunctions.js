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

/**
 * It checks for new tweets every minute and if there is a new tweet, it sends the tweet URL to a
 * channel.
 * @param remDB - The database for this project
 * @param channels - The channels object from the client.
 */
async function checkForNewTweets(remDB, channels) {
	const tweets = remDB.get('tweets');
	setInterval(() => {
		tweets.forEach(tweet => {
			const latestTweet = getUserLatestTweet(tweet.twitter_handle);
			const latestTweetTimestamp = new Date(latestTweet.created_at);
			const currentTweetTimestamp = new Date(tweet.created_at);
			if (currentTweetTimestamp.getTime() < latestTweetTimestamp.getTime()) {
				// build tweet URL
				tweetURL.splice(3, 1, tweet.twitter_handle);
				tweetURL.splice(5, 1, latestTweet.id);
				// send tweet to channel
				const tweetChannel = channels.get('tweets');
				tweetChannel.send(tweetURL.join('/'));
				// replace tweet data in db
				tweet.tweet_id = latestTweet.id;
				tweet.created_at = latestTweet.created_at;
			}
		});
	}, 1000 * 60 * 1);
}

/**
 * It gets the latest tweet from a Twitter user
 * @param twitterHandle - The twitter handle of the user you want to get the latest tweet from
 * @param interaction - (optional) The interaction object if adding a new twitter account to monitor
 * @returns The latest tweet from the user.
 */
async function getUserLatestTweet(twitterHandle, interaction) {
	const twitterUserID = await getTwitterUserID(twitterHandle, interaction);
	if (!twitterUserID) return;		// request failed, exit
	// build request
	const endpointURL = new URL(`https://api.twitter.com/2/users/${twitterUserID}/tweets`);
	const params = {
		'exclude': 'retweets,replies',
		'max_results': 5,
		'tweet.fields': 'created_at'
	};
	// send request
	const requestResponse = await get({ url: endpointURL, oauth: oAuthConfig, qs: params, json: true });
	if (requestResponse.body.title === 'UsageCapExceeded') {		// api limit, exit
		console.log('API limit reached');
		return;
	}
	if (!requestResponse.body) {		// request failed, exit
		console.log('Request failed');
		return;
	}
	if (requestResponse.body.errors) {		// bad response, exit
		console.log('Could not get user\'s latest tweet');
		return;
	}
	// success
	const latestTweet = requestResponse.body.data[0];
	return latestTweet;
}

/**
 * It takes a Twitter handle and returns the user's Twitter ID
 * @param twitterHandle - The twitter handle of the user you want to get the ID for
 * @param interaction - (optional) The interaction object if adding a new twitter account to monitor
 * @returns The twitterUserID is being returned.
 */
async function getTwitterUserID(twitterHandle, interaction) {
	// build request
	const endpointURL = new URL(`https://api.twitter.com/2/users/by/username/${twitterHandle}`);
	// send request
	const requestResponse = await get({ url: endpointURL, oauth: oAuthConfig, json: true });
	if (!requestResponse.body) {		// request failed, exit
		console.log('Request failed');
		return;
	}
	if (requestResponse.body.errors) {		// bad response, exit
		if (interaction) {
			interaction.reply({
				content: `Could not get/find the user ${twitterHandle}`,
				ephemeral: true
			});
		} else {
			console.log(`Could not get/find the user ${twitterHandle}`);
		}
		return;
	}
	// success
	const twitterUserID = requestResponse.body.data.id;
	return twitterUserID;
}

module.exports = {
	tweetURL,
	checkForNewTweets,
	getUserLatestTweet
};