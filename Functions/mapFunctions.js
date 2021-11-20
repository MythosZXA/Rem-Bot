module.exports = {
  createUserMap: function (s3, userMap) {
    let params = {Bucket: 'rembot', Key: 'userProfiles.json'};
    s3.getObject(params, function(error, data) {
      if (error) 
        console.log(error, error.stack);
      else {
        let userProfilesTable = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
        const userClass = require('../Class/userClass.js');
        userProfilesTable.table.forEach(userString => userMap.set(userString.userID, new userClass(userString)));
        console.log('User profiles updated');
      }
    });
  },
  
  createGymMap: function (s3, gymMap) {
    let params = {Bucket: 'rembot', Key: 'gymProfiles.json'};
    s3.getObject(params, function(error, data) {
      if (error) 
        console.log(error, error.stack); // an error occurred
      else {
        let gymProfilesTable = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
        const gymClass = require('../Class/gymClass.js');
        gymProfilesTable.table.forEach(gymString => gymMap.set(gymString.userID, new gymClass(gymString)));
        console.log('Gym profiles updated');
      }
    });
  }
};