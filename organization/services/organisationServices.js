const { authenticate } = require("passport");
const errorsMessages = require("../controllers/errors/errorsMessages");
const ExpectedPaymentMetaSchema = require("../models/expectedPaymentMetaSchema");
const ExpectedPayment = require("../models/expectedPaymentSchemas");
const Member = require("../models/member");
const Organization = require("../models/organization");
const PaymentRecordMeta = require("../models/paymentRecordMeta");
const PaymentSchema = require("../models/paymentSchema");

const serviceError = errorsMessages;
const dbCollectionsNames = {
    organizations: "organizations",
    members: "members",
    paymentRecordMetas: "paymentRecordMetas",
    expectedPaymentMetas: "expectedPaymentMetas"
}

const serviceChecks = {
    isDbValid: async (db) => {
        const _db = (await db)
        if(!_db || !_db.collection) {
            throw new Error(serviceError.invalidArgs);
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
        throw new Error(serviceError.invalidArgs);
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
        throw new Error(serviceError.invalidArgs);
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
        throw new Error(serviceError.invalidArgs)
    }
    
    return await orgServices.insert(db, dbCollectionsNames.paymentRecordMetas, newPaymentRecordMeta);
}

orgServices.createPaymentRecordCollection =  async (db, paymentRecordName, organizationId) => {
    serviceChecks.isDbValid(db);
    if( typeof paymentRecordName !== "string") {
        throw new Error(serviceError.invalidArgs);
    }
    if(typeof paymentRecordName !== "string") {
        throw new Error(serviceError.invalidArgs);
    }
    
    // update payment record name 
    paymentRecordName += "_" + organizationId;

    // await (await db).createCollection(paymentRecordName)
    orgServices.createCollection(db, paymentRecordName)
}

orgServices.createCollection = async (db, collectionName) => {
    await (await db).createCollection(collectionName)
}

orgServices.postPayment = async (db, paymentRecordName, newPayment = new PaymentSchema({})) => {
    serviceChecks.isDbValid(db);
    if(typeof paymentRecordName !== "string") {
        throw new Error(serviceError.invalidArgs)
    }
    if(!newPayment.userId || !newPayment.amount) {
        throw new Error(serviceError.invalidArgs)
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

orgServices.getPaymentsByPage = async (db, paymentRecordName, page = 1, skip = 50) => {
    serviceChecks.isDbValid(db);
    if(typeof page !== "number") {
        throw new Error(serviceError.invalidArgs + " - " + page.toString())
    }

    const pagedPayments = await orgServices.find(db, paymentRecordName, {}, page, skip)
    return pagedPayments;
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
orgServices.find = async (db, collectionName, query = {}, page = 1, skip = 0) => {
    skip = page === 1 ? 0 : skip * page
    const findResult = await (await db).collection(collectionName).find(query, {skip}).toArray()
    return findResult;
}

orgServices.findOne = async (db, collectionName, query = {}) => {
    const findResult = await (await db).collection(collectionName).findOne(query)
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

orgServices.updateOne = async (db, collectionName, updateFilter, fieldsToUpdate) => {
    try {
        console.log(fieldsToUpdate)
        if(fieldsToUpdate) {
            const updateResult =await (await db).collection(collectionName).updateOne(updateFilter, {$set: fieldsToUpdate})
            return updateResult;
        }
    return null;
    } catch (error) {
        console.log(error)
    }
}


orgServices.getNewExpectedPayment = (organizationId, memberId, timePeriod, amount, cycleYear) => {
    if(!memberId) {
        throw new Error( errorsMessages.invalidArgs + " - memberId");
    }
    if(!organizationId) {
        throw new Error(errorsMessages.invalidArgs + " - organizationId")
    }
    if(!amount ) {
        throw new Error(errorsMessages.invalidArgs + " - amount")
    }
    if(!timePeriod) {
        throw new Error(errorsMessages.invalidArgs + " - timePeriod")
    }
    if(!cycleYear) {
        throw new Error(errorsMessages.invalidArgs + " - cycleYear")
    }
    const newExpectedPayment = new ExpectedPayment({organizationId, memberId, timePeriod, amount, cycleYear});
    return newExpectedPayment;
}

orgServices.generateAllExpectedPayments = async (db) => {
    try {
            // load organizations
    // for each organizations
        // load paymentRecordMetas where organization id is org._id
        // do checks on paymentRecordMeta
        // load members
        // check expectedPaymentMeta
    // =====
        /* break current implementation of generate expected payment to only generate for a specific payment record and cycle position 
           that should give more control over what is generated and when it would be generated 
        */
    // =====
    // load organizations
        const organizations = await orgServices.find(db, dbCollectionsNames.organizations)
        // for each organizations
        for(let org of organizations) {
            // load paymentRecordMetas where organization id is org._id
            const paymentRecordMetas = await orgServices.find(db, dbCollectionsNames.paymentRecordMetas, {organizationId: org._id.toString()});
            for(let payRecMeta of paymentRecordMetas) {
                // do checks on paymentRecordMeta

            //#region Manage cycle position and Year
            let currentCycleTimePeriod = orgServices.getNextCyclePositionAndYear(payRecMeta.cycle, payRecMeta.currentCycle);
            let cyclePosition = currentCycleTimePeriod.currentPosition;
            let cycleYear = currentCycleTimePeriod.currentYear;
            if(payRecMeta.skipCycle === cyclePosition || payRecMeta.suspended) {
                continue;
            }

            //#endregion
                // // reading the payment records specified for the organization in the current iteration.
                // const paymentRecord = await orgServices.findOne(db, `${payRecMeta.recordName.toLowerCase()}_${org._id.toString()}`)

                // first iterate throgh each member
                //#region former Implementation
            // for(let member of members) {
            //     const expectedPaymentMetaRecordForMember = await orgServices.findOne(db, `expectedPaymentMetas_${payRecMeta._id.toString()}`, {memberId: member._id.toString()})
            //     let expectedPayment;
            //     if(expectedPaymentMetaRecordForMember && expectedPaymentMetaRecordForMember.suspended) {
            //         continue;
            //     }
            //     if(expectedPaymentMetaRecordForMember && expectedPaymentMetaRecordForMember.amount) {
            //         expectedPayment = orgServices.getNewExpectedPayment(org._id, member._id.toString(), currentCycle, expectedPaymentMetaRecordForMember.amount)
            //     }
            //     else if(payRecMeta.target) {
            //         expectedPayment = orgServices.getNewExpectedPayment(org._id, member._id.toString(), currentCycle, payRecMeta.target)
            //     }

            //     let insertedResult = await orgServices.insert(db,`expectedPayment_${payRecMeta._id.toString()}`, expectedPayment);
            //     console.log(insertedResult)
            // }
            //#endregion
                const successful = await orgServices.generateManyExpectedPayments(db, payRecMeta.target, org._id.toString(), payRecMeta._id.toString(), cyclePosition, cycleYear)

                // update paymentRecordMeta with current cycle values;
                // this only become important when we are automating the expected payment generation.
                // updates would not happen if we are only generation for a particular payment record.
                if(cyclePosition && cycleYear && successful) {
                    orgServices.updateOne(db, dbCollectionsNames.paymentRecordMetas,{_id: payRecMeta._id}, {currentCycle: cyclePosition, currentYear: cycleYear})
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

    orgServices.generateExpectedPaymentFor = async (db, organizationId, paymentRecordName, currentCycle, cycleYear) => {
        serviceChecks.isDbValid(db)
        if(!organizationId) {
            throw new Error(errorsMessages.invalidArgs + " - organizationId");
        }
        if(!paymentRecordName) {
            throw new Error(errorsMessages.invalidArgs + " - paymentRecordName")
        }
        /* load associated paymentRecordMeta */
        const paymentRecordMetas = await orgServices.find(db, "paymentRecordMetas", {organizationId});
           /* search for record with record name */
        const paymentRec = paymentRecordMetas.find(p => p.recordName.toLowerCase() === paymentRecordName.toLowerCase())
        let cyclePosition;
        if(!currentCycle) {
            let currentCycleTimePeriod = orgServices.getNextCyclePositionAndYear(paymentRec.cycle, cycleYear);
            cyclePosition = currentCycleTimePeriod.currentPosition;
            cycleYear = currentCycleTimePeriod.currentYear;
        }
        cyclePosition = currentCycle;

        /* generate bill */
        await orgServices.generateManyExpectedPayments(db, paymentRec.target, organizationId, paymentRec._id.toString(), cyclePosition, cycleYear)
    }

    /**
     * Generates expected payments for the payment record id specified and for all members that belongs to to the organization. It internally manages whether 
     * a member's expected payment record for a particular cycle should not be generated.
     * @param {any} db 
     * @param {string | number} targetAmount 
     * @param {string} organizationId 
     * @param {string} paymentRecordMetaId 
     * @param {string} currentCycle 
     * @param {string | number} cycleYear 
     */
    orgServices.generateManyExpectedPayments = async (db, targetAmount, organizationId, paymentRecordMetaId, currentCycle, cycleYear) => {
        // load members
        const members = await orgServices.find(db, dbCollectionsNames.members, {organizationId});
        let successful;
        for(let member of members) {
            successful = await orgServices.generateOneExpectedPayment(db, targetAmount, organizationId, paymentRecordMetaId, member._id.toString(), currentCycle, cycleYear)
         }
         if(successful) {
             return successful;
         }
         else {
             throw new Error(errorsMessages.databaseError)
         }
    }

    orgServices.generateOneExpectedPayment = async (db, targetAmount, organizationId, paymentRecordMetaId, memberId, currentCycle, cycleYear) => {
        /* check if expected paymetns already exists */
        let existingExpectedPayment = await orgServices.findOne(db, `expectedPayments_${paymentRecordMetaId}`, {memberId: memberId, timePeriod: currentCycle, cycleYear});
        if(existingExpectedPayment) {
            // do not generate another
            return true; // to continue
        }
        let expectedPaymentMetaRecordForMember = await orgServices.findOne(db, `expectedPaymentMetas_${paymentRecordMetaId}`, {memberId: memberId})
        let expectedPayment;
        if(expectedPaymentMetaRecordForMember && expectedPaymentMetaRecordForMember.suspended) {
            return false;
        }
        if(expectedPaymentMetaRecordForMember && expectedPaymentMetaRecordForMember.amount) {
            expectedPayment = orgServices.getNewExpectedPayment(organizationId, memberId.toString(), currentCycle, expectedPaymentMetaRecordForMember.amount)
        }
        else {
            expectedPayment = orgServices.getNewExpectedPayment(organizationId, memberId.toString(), currentCycle, targetAmount, cycleYear)
        }

        let insertedResult = await orgServices.insert(db,`expectedPayments_${paymentRecordMetaId}`, expectedPayment);
        console.log(insertedResult)
        const successful = insertedResult && insertedResult.insertedCount > 0
        if(successful) {
            /* update or create new  associated expected payments meta*/
            if(expectedPaymentMetaRecordForMember) {
                const owing = expectedPaymentMetaRecordForMember.amountOwing;
                expectedPaymentMetaRecordForMember.amountOwing = Number(owing) + Number(targetAmount);
                const updateResult = await orgServices.updateOne(db, `expectedPaymentMetas_${paymentRecordMetaId.toString()}`, 
                {_id: expectedPaymentMetaRecordForMember._id}, {amountOwing: expectedPaymentMetaRecordForMember.amountOwing})

            }
            else {
                let expectedPaymentMeta = new ExpectedPaymentMetaSchema({})
                expectedPaymentMeta.memberId = memberId;
                expectedPaymentMeta.organizationId = organizationId;
                expectedPaymentMeta.amountOwing = targetAmount;
                const insertedResult = await orgServices.insert(db, `expectedPaymentMetas_${paymentRecordMetaId.toString()}`, expectedPaymentMeta);
                if(!insertedResult || !insertedResult.insertedCount)
                {
                    throw new Error(errorsMessages.databaseError + ` - while inserting into expectedPaymentMetas_${paymentRecordMetaId.toString()}`);
                }
            }
        }
        return successful;
    }

    orgServices.getNextCyclePositionAndYear = (cycleType, currentCyclePosition, cycleYear= new Date().getFullYear()) => {
        const cycles = {
            "weekly" : [
                'week 1',  'week 2',  'week 3', 'week 4', 
                'week 5',  'week 6', 'week 7', 'week 8',
                'week 9',  'week 10', 'week 11', 'week 12',
                'week 13', 'week 14', 'week 15', 'week 16',
                'week 17', 'week 18', 'week 19', 'week 20',
                'week 21', 'week 22', 'week 23', 'week 24',
                'week 25', 'week 26', 'week 27', 'week 28',
                'week 29', 'week 30', 'week 31', 'week 32',
                'week 33', 'week 34', 'week 35', 'week 36',
                'week 37', 'week 38', 'week 39', 'week 40',
                'week 41', 'week 42', 'week 43', 'week 44',
                'week 45', 'week 46', 'week 47', 'week 48',
                'week 49', 'week 50', 'week 51', 'week 52'
              ],
            "monthly" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        }

        if(!Object.keys(cycles).includes(cycleType)) {
            throw new Error(errorsMessages.invalidArgs + " - cycleTypes")
        }
        let nextCyclePosition;
        let currentCycleYear;
        if( typeof currentCyclePosition === "string" &&  cycles[cycleType].includes(currentCyclePosition)) {
            let positionIndex  = cycles[cycleType].findIndex(x => x.toLowerCase()===currentCyclePosition? currentCyclePosition.toLowerCase(): "")
            let nextPositionIndex = positionIndex + 1 >= cycles.length ? 0 : positionIndex + 1;
            nextCyclePosition = cycles[cycleType][nextPositionIndex];
    
            // determining the year in case cycle re starts
            currentCycleYear = Number(cycleYear);
            if(currentCycleYear) {
                let cycleEndReached = false;
                for(let prop in cycles) {
                    if(cycles.hasOwnProperty(prop)) {
                        cycleEndReached = cycles[prop].length - 1 === positionIndex;
                        if(cycleEndReached) {break;} // we are breaking because we only need to check one cycle type
                    }
                }
                if(cycleEndReached) {++currentCycleYear}
            }
        }
        else {
            nextCyclePosition = cycles.monthly[new Date().getMonth()];
            currentCycleYear = !cycleYear ? new Date().getFullYear() : cycleYear;
        } 

        const currentCycleTimePeriod = {
            currentPosition: nextCyclePosition,
            currentYear: currentCycleYear
        }
        return currentCycleTimePeriod;
    }

    orgServices.getNextYear = (currentYear) => {

        let year = Number(currentYear);
        if(year) {
            // year is arithmetical
            return ++year;
        }
        else {
            throw new Error(errorsMessages.invalidArgs + "currentYear")
        }
    }

    orgServices.getCurrentYear = () => {
        return new Date().getFullYear();
    }




module.exports = orgServices;