//model 
const { User } = require('../models/User.js');
const { Message } = require('../models/Message.js');

//packages
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//exported socket from server
const socket = require('../server.js');

// validation
const {registerValidation, loginValidation, changePassValidation} = require('../validation.js');

//#region initial
exports.initial = (req,res) => {
    // do validation and destructure error and value
  res.send('server is running');
}
//#endregion

//#region REGISTER
exports.register = async(req,res) => {
    // do validation and destructure error and value
    const {error, value} =  registerValidation(req.body);

    // if error send the message response
    if(error) return res.status(400).send(error.details[0].message); 

    // email duplication validation
    const isEmailExist = await User.findOne({email: req.body.email});
    if(isEmailExist) return res.status(400).send('Email already exists!')
    
    // generate a salt
    const salt = await bcrypt.genSalt(10);  
    // combine the current password with a salt to make it complex
    const hashedPassword = await bcrypt.hash(req.body.password, salt); 

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword
    }) // create a new user that receives a json request.

    try {
        const savedUser = await user.save();

        // return only the user id
        res.send({user: user._id}); 
    } catch (error) {
        res.status(400).send(error);
    }
    // res.send(value)
}
//#endregion

//#region LOGIN
exports.login = async(req,res) => {
    // do validation and destructure error and value
    const {error, value} =  loginValidation(req.body);

    // if error send the message response
    if(error) return res.status(400).send(error.details[0].message); 

    // if email exist
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email doesnt exists.');

    // valid password
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(400).send('Invalid password.');

    //create a jwt token when logged in
    const token = jwt.sign({_id: user._id}, process.env.JWT_TOKEN);

    //put the token on the header and send it back if success
    res.header('jwt_token', token).send({...user._doc, jwt_token: token});
    // res.send(value)
}
//#endregion

//#region FIND USER INFO
exports.find = async(req,res) => {
    if(req.query.id){
        try {
            let id = req.query.id;
            let findSingleUser = await User.findById(id);

            if(!findSingleUser) return res.status(400).send('User not found.');
        
            res.send(findSingleUser);
        } catch (error) {
            res.status(400).send(error);
        }
        // find single user if there is a query
    }else{
        try {
            let findUser = await User.find();

            if(!findUser) return res.status(400).send('Users not found.');
        
            res.send(findUser);

        } catch (error) {
            res.status(400).send(error);
        }
        // else find all
    }
}
//#endregion

//#region UPDATE INFO
exports.update = async(req,res) => {
    try {
        if(!req.body) return res.status(400).send('No data to update');

        // get the id of the url param parameter in routes
        let id = req.params.id;

        let findUserAndUpdate = await User.findOneAndUpdate({_id: id}, req.body, {new: true, useFindAndModify: false});
        if(!findUserAndUpdate) return res.status(400).send(`Unable to update user with ${id}`);

        res.send(findUserAndUpdate);
        // console.log(findUserAndUpdate)
    } catch (error) {
        res.status(400).send(error);
        // console.log('ERROR UPDATE', error)
    }
    
}
//#endregion

//#region CHANGE PASSWORD
exports.changePassword = async(req,res) => {

    if(!req.body) return res.status(400).send('No data to update');

    // do validation and destructure error and value
    const {error, value} = changePassValidation(req.body);

    // if error send the message response
    if(error) return res.status(400).send(error.details[0].message); 

    // get the id of the url param parameter in routes
    let id = req.params.id;

    let user = await User.findById(id);
    if(!user) return res.status(400).send(`Unable to update find user with ${id}`);

    // valid password
    const validPassword = await bcrypt.compare(req.body.currentPassword, user.password)
    if(!validPassword) return res.status(400).send('Invalid password.');
    
    // generate a salt
    const salt = await bcrypt.genSalt(10);  
    // combine the current password with a salt to make it complex
    const hashedNewPassword = await bcrypt.hash(value.newPassword, salt); 

    // update password
    const updatePassword = await user.updateOne({password: hashedNewPassword});
    if(!updatePassword) return res.status(400).send('password update failed.');

    res.send(value)
}
//#endregion

//#region MESSAGE
exports.getMessages = async(req,res) => {
    await Message.find({},(err, messages)=> {
        res.send(messages);
    })
}
exports.postMessages = async(req,res) => {
    let message = new Message(req.body);

    await message.save((err) =>{
        if(err) sendStatus(500);

        // this is being used on chatRoomContainer to track
        // if new post is added from messageAreaContainer
        socket.io.emit('message', req.body);

        res.sendStatus(200);
    })
}
//#endregion