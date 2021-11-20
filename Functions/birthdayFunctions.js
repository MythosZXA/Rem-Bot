module.exports = {
  getSecsToMidnight: function () {
    let nowString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
    let nowTime = new Date(nowString);
    let midnight = new Date(nowTime).setHours(24, 0, 0, 0);
    return (midnight - nowTime) / 1000;
  },
  
  checkBirthdayTomorrow: function (rem, userProfiles, secsToMidnight) {
    setTimeout(() => {
      userProfiles.forEach(async (user) => {
        if (user.birthday != "") { // if user has set their birthday
          // get user birth month and date
          let birthdayFormat = user.birthday.split('/');
          let month = parseInt(birthdayFormat[0]);
          let day = parseInt(birthdayFormat[1]);
          // get today's month and date
          now = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
          let currentMonth = new Date(now).getMonth() + 1;
          let currentDate = new Date(now).getDate();
          // if it's user's birthday then send happy birthday
          if (month == currentMonth && day == currentDate) {
            let bdMember = await rem.guilds.cache.get('773660297696772096')
                                    .members.fetch(user.userID);
            rem.guilds.cache.get('773660297696772096')
              .channels.cache.get('773660297696772100')
              .send({files: [{attachment: './Pictures/Birthday Rem.jpg', name: 'Birthday Rem.jpg'}]});
            rem.guilds.cache.get('773660297696772096')
              .channels.cache.get('773660297696772100')
              .send(`Happy Birthday ${bdMember}!`);
          }
        }
      })
      // check again tomorrow
      console.log(`Hours until midnight: ${getSecsToMidnight() / 60 / 60}`);
      checkBirthdayTomorrow(userProfiles, getSecsToMidnight());
    }, (1000 * secsToMidnight) + (1000 * 5));
  }
};