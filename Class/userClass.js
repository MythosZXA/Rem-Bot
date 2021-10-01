module.exports = class user {
    constructor(userString) {
        this.userID = userString.userID;
        this.name = userString.name;
        userString.birthday == null ? this.birthday = "" : this.birthday = userString.birthday;
    }
};