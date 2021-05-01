const { authenticate } = require("passport");
const errorsMessages = require("../controllers/errors/errorsMessages");
const Member = require("../models/member");
const Organization = require("../models/organization");
const PaymentRecordMeta = require("../models/paymentRecordMeta");
const PaymentSchema = require("../models/paymentSchema");

const serviceError = errorsMessages;
const dbCollectionsNames = {
    organizations: "organizations",
    members: "members",
    paymentRecordMetas: "paymentRecordMetas"
}

const serviceChecks = {
    isDbValid: async (db) => {
        const _db = (await db)
        if(!_db || !_db.collection) {
            throw serviceError.invalidArgs + " - " + db.toString();
        }
    }
}

const orgServices = {}

/**
 * 
 * @param {*} db the database function
 * @param {string} collectionName name of the collection to access
 * @param {*} docToInsert object to sent ot database
 * @returns mongodb inserted count result object
 */
orgServices.insert = async (db, collectionName, docToInsert) => {
    const orgCollection = (await db).collection(collectionName);
    const orgInsertResult = await orgCollection.insertOne(docToInsert);
    return orgInsertResult;
}
/**
 * 
 * @param  db the database function
 * @param {Organization} newOrganisation Orgnization type contained in the models folder
 * @returns mongodb inserted count result object
 */
orgServices.createOrganisation = async (db, newOrganisation = new Organization({})) => {
    serviceChecks.isDbValid(db);
    if(!newOrganisation || newOrganisation.name === undefined || newOrganisation.userId === undefined) {
        throw new Error(serviceError.invalidArgs + " - " + newOrganisation.toString());
    }

    return await orgServices.insert(db, dbCollectionsNames.organizations, newOrganisation);
}

/**
 * Adds a new member to organization by linking a user id and organization id.
 * @param db the database function
 * @param {Member} newMember Member type contained in the models folder
 * @returns mongodb inserted count result object
 */
orgServices.addMember = async (db, newMember = new Member({}, {})) => {
    serviceChecks.isDbValid(db);
    if(!newMember || !newMember.organizationId || !newMember.userId) {
        throw new Error(serviceError.invalidArgs + " - " + newMember.toString());
    }
    
    return await orgServices.insert(db, dbCollectionsNames.members, newMember);
}

/**
 * 
 * @param db the database function
 * @param {PaymentRecordMeta} newPaymentRecordMeta Payment Record Meta type contained in the models folder
 * @returns mongodb inserted count result object
 */
orgServices.createPaymentRecordMeta = async (db, newPaymentRecordMeta = new PaymentRecordMeta({})) => {
    serviceChecks.isDbValid(db);
    if(!newPaymentRecordMeta || !newPaymentRecordMeta.recordName 
        || !newPaymentRecordMeta.userId || !newPaymentRecordMeta.organizationId) {
        throw new Error(serviceError.invalidArgs + " - " + newPaymentRecordMeta.toString())
    }
    
    return await orgServices.insert(db, dbCollectionsNames.paymentRecordMetas, newPaymentRecordMeta);
}

orgServices.createPaymentRecordCollection =  async (db, paymentRecordName, organizationId) => {
    serviceChecks.isDbValid(db);
    if( typeof paymentRecordName !== "string") {
        throw new Error(serviceError.invalidArgs + " - " + paymentRecordName.toString());
    }
    if(typeof paymentRecordName !== "string") {
        throw new Error(serviceError.invalidArgs + " - " + organizationId.toString());
    }
    
    // update payment record name 
    paymentRecordName += "_" + organizationId;

    await (await db).createCollection(paymentRecordName)
}

orgServices.postPayment = async (db, paymentRecordName, newPayment = new PaymentSchema({})) => {
    serviceChecks.isDbValid();
    if(typeof paymentRecordName !== "string") {
        throw new Error(serviceError.invalidArgs + " - " + paymentRecordName.toString())
    }
    if(!newPayment.userId || !newPayment.amount) {
        throw new Error(serviceError.invalidArgs + " - " + newPayment.toString())
    }

    const insertedResult = orgServices.insert(db, paymentRecordName, newPayment);
    return insertedResult;
}

/**
 * Queries the members collections and returns result as an array.
 * @param db The database function
 * @param {string} organizationId 
 * @param {number} page 
 * @param {number} skip 
 * @returns {Array}
 */
orgServices.getMembersByPage = async (db, organizationId, page = 1, skip = 50) => {
    serviceChecks.isDbValid(db);
    if(typeof organizationId === "undefined") {
        throw new Error(serviceError.invalidArgs);
    }
    if(typeof page !== "number") {
        throw new Error(serviceError.invalidArgs + " - " + page.toString())
    }
    const pagedMembers = await orgServices.find(db, dbCollectionsNames.members, {organizationId}, page, skip);
    return pagedMembers;
}
/**
 * Finds and returns results from the specified collection name as an array.
 * @param db The database function 
 * @param {string} collectionName Name of collection to access
 * @param {object} query query to issue to send to db
 * @param {number} page page is a multiple of skip to use
 * @param {number} skip skip is the number of documents to skip and default is zero
 * @returns {Array} returns result as an array[]
 */
orgServices.find = async (db, collectionName, query, page = 1, skip = 0) => {
    skip = page === 1 ? 0 : skip * page
    if(!query) query = {}
    const findResult = await (await db).collection(collectionName).find(query, {skip}).toArray()
    return findResult;
}

/**
 * Counts the number of documents in a collection
 * @param db The database function
 * @param {string} collectionName 
 * @param {object} query 
 * @returns {number}
 */
orgServices.count = async (db, collectionName, query) => {
    if(!query) authenticate = {}
    return await (await db).collection(collectionName).find(query).count()
}


module.exports = orgServices;