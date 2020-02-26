const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

const url = '/users'

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

beforeEach(async () => {
  await User.deleteMany({})
  const user = new User({
    username: 'Mario', 
    password: 'peachyPeach' 
  })
  await user.save()
})

describe('Adding Users', () => {

  test('Valid user gets succesfully created', async () => {
    const usersAtStart = await usersInDb()
  
    const newUser = {
      username: 'Luigi',
      password: 'Yoshi123',
    }
  
    await api
      .post(url)
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const usersAtEnd = await usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
  
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  
  test('Creation fails when username is already taken', async () => {
    const usersAtStart = await usersInDb()
  
    const newUser = {
      username: 'Mario', 
      password: '1234'
    }
  
    await api
      .post(url)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    // expect(result.body.error).toContain('`username` to be unique')
  
    const usersAtEnd = await usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('Creation fails if username or password is missing', async () => {
    const usersAtStart = await usersInDb()
  
    const missingUsername = {
      password: "Yoshi1234"
    }
  
    const missingPassword = {
      username: "Lugi"
    }
  
    await api
      .post(url)
      .send(missingUsername)
      .expect(400)
      .then((res) => expect(res.body.error).toContain("`username` is required"))
  
    await api
      .post(url)
      .send(missingPassword)
      .expect(400)
      .then((res) => expect(res.body.error).toContain("password is required"))
  
    const usersAtEnd = await usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('Creation fails if username or password is shorter than 3 characters', async () => {
    const usersAtStart = await usersInDb()
  
    const shortUsername = {
      username: "Lu",
      password: "123"
    }
  
    const shortPassword = {
      username: "Luigi",
      password: "1"
    }
  
    await api
      .post(url)
      .send(shortUsername)
      .expect(400)
      .then((res) => expect(res.body.error).toContain("is shorter than the minimum allowed"))
  
    await api
      .post(url)
      .send(shortPassword)
      .expect(400)
      .then((res) => expect(res.body.error).toContain("password must be at least 3 characters"))
  
    const usersAtEnd = await usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('Created user has skills array', async () => {
    const newUser = {
      username: "Luigi",
      password: "Yoshi123"
    }
  
    await api
      .post(url)
      .send(newUser)
      .then((res) => expect(res.body.skills).toEqual([]))
  })

})

afterAll(() => {
  mongoose.connection.close()
})

/*
 * User deletion
  - skills & battles get deleted after user deletion
  - skills are correctly referenced both ways
 * Username only consists of permitted characters
 * Error messages

 * Schema: no passwordHash, _id to id
 * Token auth
 * Skills can only be created by logged in users
 * Skills can only be accessed by associated user (same for battles)
 * Battles can only be created by right user
 * Login
*/