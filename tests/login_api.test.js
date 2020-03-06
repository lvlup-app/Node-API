const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')

const url = '/login'

const user = {
  username: 'Luigi', 
  password: 'Yoshi123'
}

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash(user.password, 10)
  const newUser = new User({
    username: user.username,
    passwordHash,
  })
  await newUser.save()
})

test('Valid user can succesfully login', async () => {
  await api
    .post(url)
    .send(user)
    .expect(200)
    .then(res => expect(res.body.token).toBeDefined())
})

test('Wrong username or password will result in status 401', async () => {
  const credentials = {
    username: "Luigi",
    password: "123"
  }

  await api
    .post(url)
    .send(credentials)
    .expect(401)
    .then(res => expect(res.body.error).toContain('invalid username or password'))
})

test('Missing username or password will result in status 400', async () => {
  const credentials = {
    username: "Luigi"
  }

  await api
    .post(url)
    .send(credentials)
    .expect(400)
    .then(res => expect(res.body.error).toContain('username or password missing'))
})

afterAll(() => {
  mongoose.connection.close()
})