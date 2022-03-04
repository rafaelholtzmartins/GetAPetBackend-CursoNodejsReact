const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const secretJWT = require('../SecretJWT')


// obter o usuário a partir do jwt token
const getUserByToken = async (token) => {
    if(!token) {
        return res.status(401).json({message: 'Acesso negado!'})
    }

    const decoded = jwt.verify(token, secretJWT)

    const userId = decoded.id

    const user = User.findById({_id: userId})
    return user
}

module.exports = getUserByToken