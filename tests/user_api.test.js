const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const testData = require('./test_data')
const db = require('./db_helper')

const {user, skills, battles} = testData
const url = '/users'

beforeEach(async () => {
  await db.initOne(user, "User")
  await db.initAll(skills, "Skill")
  await db.initAll(battles, "Battle")
})

describe('Adding Users', () => {

  test('Valid user gets succesfully created', async () => {
    const usersAtStart = await db.getDocuments("User")
  
    const newUser = {
      username: 'Luigi',
      password: 'Yoshi123',
    }
  
    await api
      .post(url)
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const usersAtEnd = await db.getDocuments("User")
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
  
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  
  test('Creation fails when username is already taken', async () => {
    const usersAtStart = await db.getDocuments("User")
  
    const newUser = {
      username: "Peach",
      password: "Itsame"
    }
  
    await api
      .post(url)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
      .then((res) => expect(res.body.error).toContain('`username` to be unique'))
  
    const usersAtEnd = await db.getDocuments("User")
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('Creation fails if username or password is missing', async () => {
    const usersAtStart = await db.getDocuments("User")
  
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
  
    const usersAtEnd = await db.getDocuments("User")
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('Creation fails if username or password is shorter than 3 characters', async () => {
    const usersAtStart = await db.getDocuments("User")
  
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
  
    const usersAtEnd = await db.getDocuments("User")
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

describe('Deleting User', () => {

  test('User gets succesfully deleted', async () => {
    const usersAtStart = await db.getDocuments("User")

    await api
      .delete(`${url}/${usersAtStart[0].id}`)
      .expect(204)

    const usersAfterDeletion = await db.getDocuments("User")
    expect(usersAfterDeletion.length).toBe(usersAtStart.length - 1)
  })
  
  test('When user is deleted, associated skills and battles get deleted', async () => {
    const users = await db.getDocuments("User")

    await api.delete(`${url}/${users[0].id}`)

    const skillsAfterDelete = await db.getDocumentsBy({user: users[0].id}, "Skill")
    expect(skillsAfterDelete.length).toBe(0)

    const battles = await db.getDocumentsBy({skill: skills[0]._id}, "Battle")
    expect(battles.length).toBe(0)
  })
})

afterAll(() => {
  mongoose.connection.close()
})