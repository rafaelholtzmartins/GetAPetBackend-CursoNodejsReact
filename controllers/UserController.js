const User = require('../models/UserModel')
const bcrypt = require('bcrypt')
const createUserToken = require('../helpers/create-user-token-helpers')
const getToken = require('../helpers/get-token-helpers')
const jwt = require('jsonwebtoken')
const secretJWT = require('../SecretJWT')
const getUserByToken = require('../helpers/get-user-token-by-token-helpers')


module.exports = class UserController {
    static async register(req,res){
        /* const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword */

        const {name, email, phone, password, confirmpassword} = req.body
        
        //validations
        if(!name) {
            res.status(422).json({message: 'O nome é obrigatório'})
            return
        }
        if(!email) {
            res.status(422).json({message: 'O email é obrigatório'})
            return
        }
        if(!phone) {
            res.status(422).json({message: 'O telefone é obrigatório'})
            return
        }
        if(!password) {
            res.status(422).json({message: 'A senha é obrigatória'})
            return
        }
        if(!confirmpassword) {
            res.status(422).json({message: 'Confirme a senha'})
            return
        }
        if(password !== confirmpassword) {
            res.status(422).json({message: 'As senha não conferem'})
            return
        }

        //valida se o usuário existe
        const userExists = await User.findOne({email: email})

        if(userExists) {
            res.status(422).json({message:'Já existe um usuário com este e-mail'})
            return
        }

        //create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //create a user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })

        try {
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
        }catch(error) {
            res.status(500).json({message: error})
        }
    }

    static async login(req,res) {

        const {email, password, status} = req.body
        

        if(!email) {
            res.status(422).json({message: 'informe o e-mail'})
            return
        }
        if(!password) {
            res.status(422).json({message: 'informe a senha'})
            return
        }

        const user = await User.findOne({email: email})
        if(!user) {
            res.status(422).json({message:'Usuário não existe'})
            return
        }

        //check password
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword) {
            res.status(422).json({message:'Senha inválida'})
            return
        }

        if(user.ativo == false) {
            res.status(422).json({message:'Usuário inativo'})
            return
        }
        await createUserToken(user, req, res)
    }

    static async checkUser(req,res) {
        let currentUser

        if(req.headers.authorization){
            const token = getToken(req)
            const decoded = jwt.verify(token, secretJWT)

            currentUser = await User.findById(decoded.id)

        } else {
            currentUser = null
        }
        res.status(200).send(currentUser)
    }

    static async getUserByID(req,res){
        const id = req.params.id
        
        const user = await User.findById(id).select('-password')
        

        if(!user) {
            res.status(422).json({
                message: 'Usuário ou senha inválida!'
            })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req,res){
        const token = getToken(req)
        //console.log(token)

        const user = await getUserByToken(token)
        console.log('antigo')
        console.log(user)
        
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword

        //const {name, email, phone, password, confirmpassword} = req.body
        //console.log(name, email, phone, password, confirmpassword)

        let image = ''
        if(req.file) {
            user.image = req.file.filename
        }

        //validações
        if(!name) {
            res.status(422).json({message: 'O nome é obrigatório'})
            return
        }
        user.name = name

        if(!email) {
            res.status(422).json({message: 'O email é obrigatório'})
            return
        }
        //verifica se já existe um usuário com o e-mail informado
        const userExists = await User.findOne({email: email})
        if(user.email !== email && userExists) {
            res.status(422).json({message:'Já existe um usuário com este e-mail'})
            return
        }
        user.email = email

        if(!phone) {
            res.status(422).json({message: 'O telefone é obrigatório'})
            return
        }
        user.phone = phone

        if(password !== confirmpassword) {
            res.status(422).json({message: 'As senha não conferem'})
            return
        } else if(password == confirmpassword && password != null){
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash
        }
        
        try {
            //retorna o dado atualizado
            await User.findByIdAndUpdate(
                {_id: user._id},
                {$set: user},
                {new: true}
            )
            res.status(200).json({
                message:'Usuário atualizado com sucesso!'
            })
        }catch (err) { 
            res.status(500).json({message: err})
        }

        
    }



}