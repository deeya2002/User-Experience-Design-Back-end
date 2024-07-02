// const jwt = require('jsonwebtoken');

// const authGuard = (req, res, next) => {
//     // check if auth header is present
//     console.log(req.headers)
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.json({
//             success: false,
//             message: "Authorization header missing!"
//         })
//     }

//     // split auth header and get token
//     // Format : 'Bearer ghfdrgthyuhgvfghjkiujhghjuhjg'
//     const token = authHeader.split(' ')[1];
//     if (!token) {
//         return res.json({
//             success: false,
//             message: "Token missing!"
//         })
//     }

//     // verify token
//     try {
//         const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decodedData;
//         next();

//     } catch (error) {
//         res.json({
//             success: false,
//             message: "Invalid token!"
//         })
//     }
// };


// const authGuardAdmin = (req, res, next) => {
//     // check if auth header is present
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.json({
//             success: false,
//             message: "Authorization header missing!"
//         })
//     }

//     // split auth header and get token
//     // Format : 'Bearer ghfdrgthyuhgvfghjkiujhghjuhjg'
//     const token = authHeader.split(' ')[1];
//     if (!token) {
//         return res.json({
//             success: false,
//             message: "Token missing!"
//         })
//     }

//     // verify token 
//     try {
//         const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decodedData;
//         if (!req.user.isAdmin) {
//             return res.json({
//                 success: false,
//                 message: "Permission denied!"
//             })
//         }
//         next();

//     } catch (error) {
//         res.json({
//             success: false,
//             message: "Invalid token!"
//         })
//     }
// };


// module.exports = {
//     authGuard,
//     authGuardAdmin
// };

const Users = require("../model/usermodel");
const jwt = require('jsonwebtoken');

const auth = async (req,res,next) =>{
    try {
        const token = req.header("Authorization")

        if(!token)  return res.status(500).json({msg: "Not Valid"})

        const decoded = jwt.verify(token, process.env.ACCESSTOKENSECRET)
        if(!decoded)  return res.status(500).json({msg: "Not Valid"})
        
        const user = await Users.findOne({_id: decoded.id})
       
        req.user = user;
        
        next();
        
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = auth;