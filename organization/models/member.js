const Member = function(m, additionalData) {
    this._id = m._id;
    this.name = m.name; // m?.firstname + " - " + m?.lastname + " - " + m?.email
    this.organizationId = m.organizationId;
    this.userId = m.userId;
    this.role = m.role;// admin, member
    this.email = m.email,
    this.phone  = m.phone
    return {
        ...additionalData,
        ...this
    }
}

module.exports = Member;