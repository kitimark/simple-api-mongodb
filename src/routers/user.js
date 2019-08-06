const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
    res.send(router.stack)
    // res.send(router.stack.map(value => {
    //     return {
    //         method: Object.keys(value.route.methods)[0],
    //         path: value.route.path
    //     }
    // }))
})

router.post('/users', async (req, res) => {
    // Create new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    // Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }

        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send({ message: 'logged out'})
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send({ message: 'logged out of all' })
    }catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router