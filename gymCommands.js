const fs = require('fs');
const AWS = require("aws-sdk");

function push(message, gymMap) {
  message.channel.send(
    `Your push stats:
    Inclined Barbell Press: ${gymMap.get(message.author.id).iBBPress}
    Flat Barbell Press: ${gymMap.get(message.author.id).fBBPress}
    Dumbbell Overhead Push: ${gymMap.get(message.author.id).dbOHP}
    Close Grip Barbell Bench: ${gymMap.get(message.author.id).closeGrip}
    Standing Barbell Overheadpush: ${gymMap.get(message.author.id).standingBBOHP}`);
}

function pull(message, gymMap) {
  message.channel.send(
    `Your pull stats:
    Pull Down: ${gymMap.get(message.author.id).pullDown}
    Bent Over Row: ${gymMap.get(message.author.id).bentRow}
    Machine Row: ${gymMap.get(message.author.id).machineRow}
    Cable Row: ${gymMap.get(message.author.id).cableRow}`);
}

function legs(message, gymMap) {
  message.channel.send(
    `Your legs stats:
    Lunges: ${gymMap.get(message.author.id).lunges}
    Deadlift: ${gymMap.get(message.author.id).deadlift}
    Squat: ${gymMap.get(message.author.id).squat}
    Leg Press: ${gymMap.get(message.author.id).legPress}`);
}

function setiBBPress(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).iBBPress = arg[2];
  saveToFile(message, gymMap, s3);
}

function setfBBPress(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).fBBPress = arg[2];
  saveToFile(message, gymMap, s3);
}

function setDBOHP(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).altDBOHP = arg[2];
  saveToFile(message, gymMap, s3);
}

function setpullDown(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).pullDown = arg[2];
  saveToFile(message, gymMap, s3);
}

function setbentRow(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).bentRow = arg[2];
  saveToFile(message, gymMap, s3);
}

function setlunges(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).lunges = arg[2];
  saveToFile(message, gymMap, s3);
}

function setdeadlift(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).deadlift = arg[2];
  saveToFile(message, gymMap, s3);
}

function setcloseGrip(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).closeGrip = arg[2];
  saveToFile(message, gymMap, s3);
}

function setstandingBBOHP(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).standingBBOHP = arg[2];
  saveToFile(message, gymMap, s3);
}

function setmachineRow(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).machineRow = arg[2];
  saveToFile(message, gymMap, s3);
}

function setcableRow(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).cableRow = arg[2];
  saveToFile(message, gymMap, s3);
}

function setsquat(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).squat = arg[2];
  saveToFile(message, gymMap, s3);
}

function setlegPress(message, gymMap, arg, s3) {
  gymMap.get(message.author.id).legPress = arg[2];
  saveToFile(message, gymMap, s3);
}

function saveToFile(message, gymMap, s3) {
  let gymProfilesTable = {
    table: []
  };
  const iterator = gymMap.values();
  const iteratorFlag = gymMap.values();
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
  "setfbbpress" : setfBBPress,
  "setdbohp" : setDBOHP,
  "setpulldown" : setpullDown,
  "setbentrow" : setbentRow,
  "setlunges" : setlunges,
  "setdeadlift" : setdeadlift,
  "setclosegrip" : setcloseGrip,
  "setstandingbbohp" : setstandingBBOHP,
  "setmachinerow" : setmachineRow,
  "setcablerow" : setcableRow,
  "setsquat" : setsquat,
  "setlegpress" : setlegPress
};