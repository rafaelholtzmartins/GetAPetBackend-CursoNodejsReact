const { isValidObjectId } = require('mongoose')
const getToken = require('../helpers/get-token-helpers')
const getUserByToken = require('../helpers/get-user-token-by-token-helpers')
const Pet = require('../models/PetModel')

module.exports = class PetController {
    static async create(req,res){
        console.log('cadastrando pet')
        const name = req.body.name
        const age = req.body.age
        const weight = req.body.weight
        const color = req.body.color
        const available = true
        const images = req.files

        //validações
        if(!name) {
            res.status(422).json({message: 'Informe o nome!'})
            return
        }
        if(!age) {
            res.status(422).json({message: 'Informe a idade!'})
            return
        }
        if(!weight) {
            res.status(422).json({message: 'Informe o peso!'})
            return
        }
        if(!color) {
            res.status(422).json({message: 'Informe a cor!'})
            return
        }

        if(images.length === 0) {
            res.status(422).json({message: 'A imagem é obrigatória'})
            return
        }

        //obter o usuário dono do pet
        const token = getToken(req)
        const user = await getUserByToken(token)
        console.log(user)
        
        const pet = new Pet({
            name,
            age,
            weight,
            color,
            images: [],
            available,
            user:{_id: user.id}
        })
        images.map((image) =>{
            pet.images.push(image.filename)
        })
        console.log(pet)

        try {
            const newPet = await pet.save()
            res.status(200).json({message:'pet cadastrado!', newPet})
        }catch (error) {
            res.status(500).json({message: error})
        }
    }

    static async getAll(req, res){
        console.log('mostrar todos pets')
        const pets = await Pet.find().sort('-updatedAt')
        res.status(200).json({
            pets: pets
        })
    }

    static async getAllUserPets(req,res){
        console.log('Meus pets')
        //obter o usuário dono do pet
        const token = getToken(req)
        const user = await getUserByToken(token)
        
        const pets = await Pet.find({'user._id': user._id.toString()}).sort()
        res.status(200).json({
            pets
        })
    }

    static async getAllUserAdoptions(req,res) {
        console.log('minhas adoções')
        console.log('Meus pets')
        //obter o usuário dono do pet
        const token = getToken(req)
        const user = await getUserByToken(token)
        console.log(user._id.toString())
        
        const pets = await Pet.find({'adopter._id': user._id.toString()}).sort()
        res.status(200).json({
            pets
        })
    }

    static async getPetById(req,res) {

        const id = req.params.id
        console.log(id)
        

        if(!isValidObjectId(id)){
            console.log('id inválido')
            res.status(400).json({message: "id inválido"})
            return 
        }
        

        const pet = await Pet.findById({'_id': id.toString()}).sort()
        
        if(!pet) {
            res.status(200).json({message: "pet não localizado"})

        } else {
            res.status(200).json({pet})
        }

        
    }

    static async deletePetById(req, res){
        console.log('delete pet')
        const id = req.params.id
        console.log(id)

        if(!isValidObjectId(id)){
            console.log('id inválido')
            res.status(200).json({message: "id inválido"})
            return 
        }

        //Localiza Pet
        const pet = await Pet.findById({'_id': id.toString()}).sort()
        
        if(!pet) {
            res.status(400).json({message: "pet não localizado"})
            return
        }

        //Localiza proprietário do Pet
        const token = getToken(req)
        const user = await getUserByToken(token)


        //verifica se o usuário é dono do Pet
        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: "Você não é dono deste pet"})
            return
        }
        

        if(pet){
            const petDelete = await Pet.findByIdAndDelete({'_id': id.toString()})
            res.status(200).json({petDelete})
        }

        
    }

    static async updatePet(req,res) {
        console.log('atualizar pet')
        const id = req.params.id.toString()

        //verifica se o id é um ID válido
        if(!isValidObjectId(id)){
            console.log('id inválido')
            res.status(200).json({message: "id inválido"})
            return 
        }


        const pet = await Pet.findById({'_id': id.toString()}).sort()
        
        if(!pet) {
            res.status(200).json({message: "pet não localizado"})
            return
        }

        //Localiza proprietário do Pet
        const token = getToken(req)
        const user = await getUserByToken(token)


        //verifica se o usuário é dono do Pet
        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: "Você não é dono deste pet"})
            return
        }
        
        const name = req.body.name
        const age = req.body.age
        const weight = req.body.weight
        const color = req.body.color
        const available = req.body.available
        const images = req.files

        const updatePet = {}

        //validações
        if(!name) {
            res.status(422).json({message: 'Informe o nome!'})
            return
        } else{
            updatePet.name = name
        }

        if(!age) {
            res.status(422).json({message: 'Informe a idade!'})
            return
        } else{
            updatePet.age = age
        }

        if(!weight) {
            res.status(422).json({message: 'Informe o peso!'})
            return
        } else{
            updatePet.weight = weight
        }

        if(!color) {
            res.status(422).json({message: 'Informe a cor!'})
            return
        } else{
            updatePet.color = color
        }

        if(images.length === 0) {
            res.status(422).json({message: 'A imagem é obrigatória'})
            return
        } else {
            updatePet.images = []
            images.map((image) => {
                updatePet.images.push(image.filename)
            })
            
        }
        

        await Pet.findByIdAndUpdate(id, updatePet)
        res.status(200).json({message: 'Pet atualizado com sucesso'})

    }

    static async schedule(req,res) {
        console.log('agendar')
        const id = req.params.id.toString()

        if(!isValidObjectId(id)){
            console.log('id inválido')
            res.status(200).json({message: "id inválido"})
            return 
        }

        //Localiza Pet
        const pet = await Pet.findById({'_id': id}).sort()
        
        if(!pet) {
            res.status(400).json({message: "pet não localizado"})
            return
        }

        //Localiza proprietário do Pet
        const token = getToken(req)
        const user = await getUserByToken(token)
        const userId = user._id.toString()
        const donoId = pet.user._id

        //verifica se o usuário é dono do Pet
        if(donoId == userId) {
            res.status(422).json({message: "Este Pet é seu"})
            return
        }

        //verifica se o pet já foi adotado
        if(pet.available === false){
            res.status(422).json({message: "este pet já foi adotado"})
            return
        }
        if(pet.adopter) {
            const adotante = pet.adopter._id
            console.log(adotante)
            if(adotante == userId) {
                res.status(422).json({message: "você já adotou este pet"})
                return
            }
            if(adotante != userId) {
                res.status(422).json({message: "este pet já foi adotado"})
                return
            }
        }

        //agendar
        pet.adopter = {_id: userId}
        await Pet.findByIdAndUpdate(id, pet)
        res.status(200).json({message: "Agendado com sucesso"})
    }

    static async concludeAdoption(req,res){
        console.log('concluir adoção')
        const id = req.params.id.toString()

        if(!isValidObjectId(id)){
            console.log('id inválido')
            res.status(200).json({message: "id inválido"})
            return 
        }

        //Localiza Pet
        const pet = await Pet.findById({'_id': id}).sort()
        
        if(!pet) {
            res.status(400).json({message: "pet não localizado"})
            return
        }

        //Localiza proprietário do Pet
        const token = getToken(req)
        const user = await getUserByToken(token)
        const userId = user._id.toString()
        const donoId = pet.user._id

        //verifica se o usuário é dono do Pet
        if(donoId == userId) {
            res.status(422).json({message: "Este Pet é seu"})
            return
        }

        //verifica se o pet já foi adotado
        if(pet.available === false){
            res.status(422).json({message: "este pet já foi adotado"})
            return
        }

        if(!pet.adopter){
            res.status(422).json({message: "você ainda não agendou uma visita"})
            return
        }

        if(pet.adopter._id !== userId){
            res.status(422).json({message: "Outra pessoa agendou uma visita"})
            return
        }


        //concluir adoção
        pet.available = false
        await Pet.findByIdAndUpdate(id, pet)
        res.status(200).json({message: "adotado com sucesso"})
    
    }

}