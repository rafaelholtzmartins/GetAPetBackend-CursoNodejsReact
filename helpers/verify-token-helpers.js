const jwt = require('jsonwebtoken')
const secretJWT = require('../SecretJWT')
const getToken = require('./get-token-helpers')

//middleware
const checkToken = (req, res, next) => {

    if(!req.headers.authorization){
        return res.status(401).json({
            message: 'Acesso negado! Você não enviou o token'
        })
    }

    const token = getToken(req)
    if(!token) {
        return res.status(401).json({
            message: 'Acesso negado! Token inválido'
        })
    }

    try{
        const verified = jwt.verify(token, secretJWT)
        req.user = verified
        next()
    } catch (err) {
        return res.status(400).json({message: 'Token inválido!'})
    }
}

module.exports = checkToken