const router = require('express').Router()
const PetController = require('../controllers/PetController')
const { imageUpload } = require('../helpers/imagem-upload-helpers')

const verifyToken = require('../helpers/verify-token-helpers')

router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)
router.get('/', PetController.getAll)
router.get('/mypets', verifyToken, PetController.getAllUserPets)
router.get('/myadoptions', verifyToken, PetController.getAllUserAdoptions)
router.get('/:id', PetController.getPetById)
router.delete('/delete/:id', verifyToken, PetController.deletePetById)
router.patch('/:id', verifyToken, imageUpload.array('images'), PetController.updatePet)
router.patch('/schedule/:id', verifyToken, PetController.schedule)
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption)

module.exports = router