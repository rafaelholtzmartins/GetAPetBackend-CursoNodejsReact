const jwt = require('jsonwebtoken')
const secretJWT = require('../SecretJWT')


const createUserToken = async(user, req, res) => {
    //create token
    const token = jwt.sign({
        name: user.name,
        id: user.id
    }, secretJWT)
    //return token
    res.status(200).json({
        message: "Você está autenticado",
        token: token,
        userId: user.id
    })

}

module.exports = createUserToken