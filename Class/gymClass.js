module.exports = class gym {
    constructor(gymString) {
        this.userID = gymString.userID;
        this.name = gymString.name;
        this.iBBPress = gymString.iBBPress;
        this.fBBPress = gymString.fBBPress;
        this.altDBOHP = gymString.altDBOHP;
        this.pullDown = gymString.pullDown;
        this.bentRow = gymString.bentRow;
        this.lunges = gymString.lunges;
        this.deadlift = gymString.deadlift;
        this.closeGrip = gymString.closeGrip;
        this.standingBBOHP = gymString.standingBBOHP;
        this.machineRow = gymString.machineRow;
        this.cableRow = gymString.cableRow;
        this.squat = gymString.squat;
        this.legPress = gymString.legPress;
    }
};