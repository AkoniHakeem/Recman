const Organization = require("../models/organization");
const orgServices = require("../services/organisationServices");
const {responseMessages: resMsg} = require("../../lib/responseMessages");
const User = require("../../auth/models/user");
const Member = require("../models/member");
const PaymentRecordMeta = require("../models/paymentRecordMeta");
const PaymentSchema = require("../models/paymentSchema");
const { ObjectId } = require("mongodb");
const db = require("../db")();

const organizationController = {}
organizationController.create = async (req, res) => {
    try {
        // todo: implement request body validation
        const {name} = req.body;
        const {id} = req.currentUser;
    
        const insertCountResult = await orgServices.createOrganisation( db, new Organization({name, userId: id}));
        if(insertCountResult.insertedCount > 0) {
            res.json({message: resMsg.successful})
        }
        else {
            res.status(400).json({message: resMsg.failed})
        }
    } catch (error) {
        // todo: implement proper error logging
        console.log(error)
        res.status(500).send();
    }
}

organizationController.getOrganizations = async (req, res) => {
    try {
        // todo: implement query param validations
        const {organizationId, userId} = req.query;
        const organizations = await (await db).collection("organizations").find({ userId}).toArray()
        res.json(organizations)
    } catch (error) {
        // todo: implement proper error logging
        console.log(error)
        res.status(500).send();
    }
}

// todo: test function
organizationController.addMember = async (req, res) => {
    try {
        const userDetails = req.body;
        // if(!dbRoles.findIndex(role => role === userDetails.role));
        // {
        //     // todo: implement or move to validation middleware
        // }
        const user = new User(userDetails);
        const memberUser = new Member(userDetails)
        
        // remove user object propertises form user details and the rest
        for(let prop in user) {
            if(user.hasOwnProperty(prop)) {
                delete userDetails[prop];
            }
        }
        const insertedResult = await  orgServices.addMember(db, new Member(memberUser, userDetails));
        if(insertedResult.insertedCount > 0) {
            res.json({message: resMsg.successful})
        }
        else {
            res.status(400).json({message: resMsg.failed})
        }
    } catch (error) {
        // todo: implement proper error logging
        console.log(error)
        res.status(500).send();
    }
}

organizationController.getMembers = async (req, res) => {
    try {
        // get members 
        // count members
        // get 50
        // return 50, page Number and pages left
        // examaple: (await db).collection("members").find({}, {skip})
        let {page: pageToGet, organizationId} = req.query
        pageToGet = Number(pageToGet)
        const membersCount = await orgServices.count(db, "members", {organizationId})
        const pagedMembers = await orgServices.getMembersByPage(db, organizationId, pageToGet);
        res.json({count: membersCount, page: pageToGet, result: pagedMembers});
    } catch (error) {
        // todo: implement proper error logging
        console.log(error)
        res.status(500).send();
    }
}

organizationController.createPayment = async (req, res) => {
    try {
        const currentUserId = req.currentUser.id;
        let paymentRecordMeta = new PaymentRecordMeta(req.body);
        paymentRecordMeta.recordName = paymentRecordMeta.recordName.toLowerCase().replace(" ", "_")
        paymentRecordMeta.userId = currentUserId;
        const insertedResult = await orgServices.createPaymentRecordMeta(db, paymentRecordMeta);
        if(insertedResult.insertedCount > 0) {
            await orgServices.createPaymentRecordCollection(db, paymentRecordMeta.recordName, paymentRecordMeta.organizationId);
            res.json({message: resMsg.successful}) 
        }
        else {
            res.status(400).json({message: resMsg.failed})
        }
    } catch (error) {
        // todo: implement proper error logging
        console.log(error)
        res.status(500).send();
    }
}

organizationController.postPaymentRecord = async (req, res) => {
    try {
        let {recordName, amount, userId} = req.body;
        const paymentRecordSchmaData = new PaymentSchema(req.body);
        const organizationId = paymentRecordSchmaData.organizationId;
        const organizationPaymentMeta = await (await db).collection("paymentRecordMetas").findOne({organizationId, recordName });
        const member = await (await db).collection("members").findOne({userId})

        recordName = recordName.toLowerCase().replace(" ", "_") + "_" + paymentRecordSchmaData.organizationId;
        
        const insertedResult = await orgServices.postPayment(db, recordName, paymentRecordSchmaData);

        if(insertedResult.insertedCount > 0) {
            const expectedPaymentToUpdate = await (await db).collection(`expectedPaymentMetas_${organizationPaymentMeta._id.toString()}`)
            .findOne({memberId: member._id.toString(), organizationId});
            const amountOwing = expectedPaymentToUpdate.amountOwing - amount;
            const amountLastPaid = amount;
            const dateOfLastPayment = Date.now();
            expectedPaymentToUpdate.dateOfLastPayment = Date.now();

            const updateResult = await (await db)
            .collection(`expectedPaymentMetas_${organizationPaymentMeta._id.toString()}`)
            .updateOne({memberId: member._id.toString(), organizationId}, 
                {$set: {amountOwing, amountLastPaid, dateOfLastPayment}});

            res.json({message: resMsg.successful})
        }
        else {
            res.status(400).json({message: resMsg.failed})
        }
        // }
        // else {
        //     /* just send */
        //     res.json({message: resMsg.successful})
        // }
    } catch (error) {
        // todo: implement proper error logging
        console.log(error)
        res.status(500).send();
    }
}

// get payments
// todo: implement validations
organizationController.getPayments = async (req, res) => {
    try {
        let {page: pageToGet=1, recordName, organizationId} = req.query;
        pageToGet = +pageToGet;
        recordName = recordName.toLowerCase()
        recordName = recordName.replace(" ", "_") + "_" + organizationId;

        // orgServices.generateExpectedPayment(db)
        const paymentRecordName = recordName;
        const skip = 50; // can be configured by client
        const paymentsCount = await (await db).collection(paymentRecordName).countDocuments();
        const pagedPayments = await orgServices.getPaymentsByPage(db,paymentRecordName, pageToGet, skip)
        pagedPayments.forEach(pay => {
            delete pay.createdAt;
            delete pay.updatedAt;
            pay.date = new Date(pay.date)
        })
        const pagedResponse =  {
            count: paymentsCount,
            page: pageToGet,
            result: pagedPayments
        } 
        res.json(pagedResponse);        
    } catch (error) {
        // todo: implement proper error logging
        console.log(error)
        res.status(500).send();
    }
}

organizationController.getPaymentRecords = async (req, res) => {
    let {organizationId} = req.query
    const paymentRecords = await (await db).collection("paymentRecordMetas").find({organizationId}).toArray()
    res.json(paymentRecords)
}

organizationController.getUser = async function(req, res) {
    const {email, phone } = req.query;
    const query = email? {email} : {phone}
    const user = await (await db).collection("users").findOne(query);
    if(user && user._id) {
        res.json(user);
    }else {
        res.status(400).json({message: "user not found"})
    }
}

/* expected payments */
organizationController.getExpectedPayments = async (req, res) => {
    const {paymentRecordName, organizationId} = req.params;

    /* get payment record meta with organizationId*/
    const paymentRecordsMetas = await orgServices.find(db, "paymentRecordMetas", {organizationId});
        /* search for record with record name */
    const paymentRec = paymentRecordsMetas.find(p => p.recordName.toLowerCase() === paymentRecordName.toLowerCase())
    /* find expected payments with paymentRec._id */
    const expectedPayments = await orgServices.find(db, `expectedPayments_${paymentRec._id.toString()}`)
    expectedPayments.forEach(p => {
        delete p.updatedAt;
        p.createdAt = new Date(p.createdAt);
    })
    console.log(expectedPayments);
    res.json(expectedPayments);
}

organizationController.generateExpectedPayments = async (req, res) => {
    try {
    /* get params */
    const {paymentRecordName, organizationId, timePeriod, year} = req.body;
    await orgServices.generateExpectedPaymentFor(db, organizationId, paymentRecordName, timePeriod, year);
    res.status(200).json({});
    } catch (error) {
        // todo: handle error
        console.log(error)
        res.status(500).send()
    }
    
}

organizationController.getMember = async (req, res) => {
    const {memberId} = req.query;
    const member = await (await db).collection('members').findOne({_id: ObjectId(memberId)})
    res.json(member);
} 

organizationController.getMemberPayments = async (req, res) => { 
    const {memberId, organizationId} = req.query;
    const user = await (await db).collection("members").findOne({_id: ObjectId(memberId)});
    // const collectionNames = await(await db).collections();
    const organizationPaymentsMetas = await (await db).collection("paymentRecordMetas").find({organizationId}).toArray();
    const paymentsRecords = await Promise.all (organizationPaymentsMetas.map(async(doc) => {
        const userId = user? user.userId : '';
        const paymentsForMember = await(await (await db).collection(doc.recordName + "_" + organizationId).find({userId: userId})).toArray()
        console.log(paymentsForMember);
        paymentsForMember.map(p => {
            p['paymentRecord'] = doc.recordName;
            return p;
        })
        return paymentsForMember;
    }));
    console.log(paymentsRecords)
    res.json(paymentsRecords.flat());
}

organizationController.getMemberExpectedPayments = async (req, res) => { 
    const { memberId, organizationId } = req.query;
    const organizationPaymentsMetas = await (await db).collection("paymentRecordMetas").find({organizationId}).toArray();
    const expectedPayments = await Promise.all (organizationPaymentsMetas.map(async(doc) => {
        const expectedPaymentForMember = await (await (await db).collection("expectedPaymentMetas" + "_" + doc["_id"].toString()).findOne({memberId, organizationId}));
        console.log(expectedPaymentForMember);
        expectedPaymentForMember['paymentRecord'] = doc.recordName;
        return expectedPaymentForMember;
    }))
    console.log(expectedPayments);
    res.json(expectedPayments.flat());
}
module.exports = organizationController;        
