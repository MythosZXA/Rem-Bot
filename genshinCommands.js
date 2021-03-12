function daily(message) {
  let dayOfWeek = new Date().getDay();
  switch(dayOfWeek) {
    case 1:
    case 4:
      message.channel.send('Today\'s dailes:', {files: ["./Genshin/Mon-Thu.jpg"]});
      break;
    case 2:
    case 5:
      message.channel.send('Today\'s dailes:', {files: ["./Genshin/Tue-Fri.jpg"]});
      break;
    case 3:
    case 6:
      message.channel.send('Today\'s dailes:', {files: ["./Genshin/Wed-Sat.jpg"]});
      break;
    case 0:
      message.channel.send('Everything can be obtained today!');
      break;
  }
}

module.exports = {
  daily
};
