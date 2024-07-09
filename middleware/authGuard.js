// const Users = require("../model/usermodel");
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        let token = req.headers['authorization'];
        if (!token) return res.status(500).json({ msg: "Not Valid" });

        token = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        const decoded = jwt.verify(token, process.env.ACCESSTOKENSECRET);
        if (!decoded) return res.status(500).json({ msg: "Not Valid" });

        // Uncomment and modify the following lines if you need to find the user from the database
        // const user = await Users.findOne({ _id: decoded.id });
        // if (!user) return res.status(404).json({ msg: "User not found" });
        // req.user = user;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(500).json({ errormsg: err.message });
    }
};

module.exports = auth;