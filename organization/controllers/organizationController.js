const Organization = require("../models/organization");
const orgServices = require("../services/organisationServices");
const {responseMessages: resMsg} = require("../../lib/responseMessages");
const User = require("../../auth/models/user");
const Member = require("../models/member");
const PaymentRecordMeta = require("../models/paymentRecordMeta");
const errorsMessages = require("./errors/errorsMessages");
const PaymentSchema = require("../models/paymentSchema");
const dbRoles = require("../roles");
const { orgControllerErrors } = require("./errors/errorsHandler");
const { ObjectID } = require("bson");
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
        const usser = new User(userDetails);
        const memberUser = new Member(userDetails)
        
        // remove user object propertises form user details and the rest
        for(let prop in usser) {
            if(usser.hasOwnProperty(prop)) {
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
        let {recordName} = req.body;
        const paymentRecordSchmaData = new PaymentSchema(req.body);
        recordName = recordName.toLowerCase().replace(" ", "_") + "_" + paymentRecordSchmaData.organizationId;
        const insertedResult = await orgServices.postPayment(db, recordName, paymentRecordSchmaData);
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

// get payments
// todo: implement validations
organizationController.getPayments = async (req, res) => {
    try {
        let {page: pageToGet=1, recordName, organizationId} = req.query;
        pageToGet = +pageToGet;
        recordName = recordName.toLowerCase()
        recordName = recordName.replace(" ", "_") + "_" + organizationId;
        const paymentRecordName = recordName;
        const skip = 50; // can be configured by client
        const paymentsCount = await (await db).collection(paymentRecordName).countDocuments();
        const pagedPayments = await orgServices.getPaymentsByPage(db,paymentRecordName, pageToGet, skip)
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

module.exports = organizationController;        
