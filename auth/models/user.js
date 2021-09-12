const User = function(u) {
    this._id = u._id;
    this.firstname = u.firstname;
    this.lastname = u.lastname;
    this.gender = u.gender;
    this.phone = u.phone;
    this.email = u.email;
    this.createdAt = u.createdAt
    this.updatedAt = u.updatedAt
    this.createdBy = u.createdBy;
    this.updateBy = u.updateBy;
}

module.exports = User
