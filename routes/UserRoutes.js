const router = require('express').Router()
const UserController = require('../controllers/UserController')


//middleware
const verifyToken = require('../helpers/verify-token-helpers')
const { imageUpload } = require('../helpers/imagem-upload-helpers')


router.post('/register', UserController.register)
router.post('/login', UserController.login)

router.get('/checkuser',verifyToken, UserController.checkUser)
router.get('/:id', UserController.getUserByID)
router.patch('/edit/:id', verifyToken, imageUpload.single('image'), UserController.editUser)


module.exports = router