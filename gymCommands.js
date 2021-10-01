const fs = require('fs');
const AWS = require("aws-sdk");
AWS.config.loadFromPath('./JSON/config.json');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

function push(message, gymProfiles) {
  message.channel.send(
    `Your push stats:
    Inclined Barbell Press: ${gymProfiles.get(message.author.id).iBBPress}
    Flat Barbell Press: ${gymProfiles.get(message.author.id).fBBPress}
    Alternating Dumbbell Overheadpush: ${gymProfiles.get(message.author.id).altDBOHP}
    Close Grip Barbell Bench: ${gymProfiles.get(message.author.id).closeGrip}
    Standing Barbell Overheadpush: ${gymProfiles.get(message.author.id).standingBBOHP}`);
}

function pull(message, gymProfiles) {
  message.channel.send(
    `Your pull stats:
    Pull Down: ${gymProfiles.get(message.author.id).pullDown}
    Bent Over Row: ${gymProfiles.get(message.author.id).bentRow}
    Machine Row: ${gymProfiles.get(message.author.id).machineRow}
    Cable Row: ${gymProfiles.get(message.author.id).cableRow}`);
}

function legs(message, gymProfiles) {
  message.channel.send(
    `Your legs stats:
    Lunges: ${gymProfiles.get(message.author.id).lunges}
    Deadlift: ${gymProfiles.get(message.author.id).deadlift}
    Squat: ${gymProfiles.get(message.author.id).squat}
    Leg Press: ${gymProfiles.get(message.author.id).legPress}`);
}

function setiBBPress(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).iBBPress = arg[2];
  saveToFile(message, gymProfiles);
}

function setfBBPress(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).fBBPress = arg[2];
  saveToFile(message, gymProfiles);
}

function setaltDBOHP(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).altDBOHP = arg[2];
  saveToFile(message, gymProfiles);
}

function setpullDown(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).pullDown = arg[2];
  saveToFile(message, gymProfiles);
}

function setlunges(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).lunges = arg[2];
  saveToFile(message, gymProfiles);
}

function setdeadlift(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).deadlift = arg[2];
  saveToFile(message, gymProfiles);
}

function setcloseGrip(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).closeGrip = arg[2];
  saveToFile(message, gymProfiles);
}

function setstandingBBOHP(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).standingBBOHP = arg[2];
  saveToFile(message, gymProfiles);
}

function setmachineRow(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).machineRow = arg[2];
  saveToFile(message, gymProfiles);
}

function setcableRow(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).cableRow = arg[2];
  saveToFile(message, gymProfiles);
}

function setsquat(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).squat = arg[2];
  saveToFile(message, gymProfiles);
}

function setlegPress(message, gymProfiles, arg) {
  gymProfiles.get(message.author.id).legPress = arg[2];
  saveToFile(message, gymProfiles);
}

function saveToFile(message, gymProfiles) {
  let gymProfilesTable = {
    table: []
  };
  const iterator = gymProfiles.values();
  const iteratorFlag = gymProfiles.values();
  do {
    let next = iterator.next().value;
    if(next !== undefined) {
      gymProfilesTable.table.push(next);
    }
  } while (!iteratorFlag.next().done);

  fs.writeFile('./JSON/gymProfiles.json', JSON.stringify(gymProfilesTable, null, '\t'), error => {
    if (error) {
      console.log('Error writing file', error);
  } else {
      console.log('Successfully wrote file');
      message.channel.send('Set!');
  }
  });

  let uploadParams = {Bucket: 'rembot', Key: 'gymProfiles.json', Body: ''};
  let file = './JSON/gymProfiles.json';
  let fileStream = fs.createReadStream(file);
  fileStream.on('error', function(error) {
    console.log('File Error', error);
  });
  uploadParams.Body = fileStream;
  s3.upload (uploadParams, function (error, data) {
    if (error) {
      console.log("Error", error);
    } if (data) {
      console.log("Upload Success", data.Location);
    }
  });
}

module.exports = {
  push,
  pull,
  legs,
  "setibbpress" : setiBBPress,
  "setfbbpress" : setiBBPress,
  "setaltdbohp" : setaltDBOHP,
  "setpulldown" : setpullDown,
  "setlunges" : setlunges,
  "setdeadlift" : setdeadlift,
  "setclosegrip" : setcloseGrip,
  "setstandingbbohp" : setstandingBBOHP,
  "setmachinerow" : setmachineRow,
  "setcablerow" : setcableRow,
  "setsquat" : setsquat,
  "setlegpress" : setlegPress
};