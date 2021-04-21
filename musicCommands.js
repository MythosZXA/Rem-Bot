const ytdl = require('ytdl-core');

let servers = {};

async function play(message, arg) {
  async function playAudio(connection, message) {
    let server = servers[message.guild.id];

    server.dispatcher = connection.play(ytdl(server.queue[0]));

    server.queue.shift();

    server.dispatcher.on("finish", function() {
      if(server.queue[0]) {
        playAudio(connection, message);
      } else {
        connection.disconnect();
        server.dispatcher.destroy();
      }
    })
  }

  // validate if message was sent from server
  if(!message.guild) {
    message.channel.send('Only for servers!');
    return;
  }
  // validate youtube link
  if(!arg[2] || !arg[2].toLowerCase().includes('https')) {
    message.channel.send('Please provide a valid YouTube link!');
    return;
  }
  // validate if user in voice channel
  if(!message.member.voice.channel) {
    message.channel.send('Please join a voice channel first!');
    return;
  }

  if(!servers[message.guild.id]) {
    servers[message.guild.id] = {queue: []}
  }

  let server = servers[message.guild.id];

  server.queue.push(arg[2]);

  if(!message.guild.voice.channel) {
    const connection = await message.member.voice.channel.join();
    playAudio(connection, message);
  }
}

async function skip(message) {
  let server = servers[message.guild.id];
  if(server.dispatcher) server.dispatcher.end();
  message.channel.send('Playing next song!');
}

async function stop(message) {
  let server = servers[message.guild.id];
  if(message.guild.voice.connection) {
    for(let i = server.queue.length - 1; i >= 0; i--) {
      server.queue.splice(i, 1);
    }

    server.dispatcher.destroy();
    message.channel.send('End of playlist. Goodbye!');
    console.log('queue ended');
  }

  if(message.guild.voice) {
    message.guild.voice.connection.disconnect();
  }
}

module.exports = {
  play,
  skip,
  stop
};
