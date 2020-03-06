const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const testData = require('./test_data')
const db = require('./db_helper')
const requestHelper = require('./request_helper')

const {user, skills, battles} = testData
const url = '/users'
const _ = requestHelper(api, url)

beforeEach(async () => {
  await db.initOne(user, "User")
  await db.initAll(skills, "Skill")
  await db.initAll(battles, "Battle")
})

describe('Adding Users', () => {
  const validUser = {
    username: 'Luigi',
    password: 'Yoshi123',
  }

  test('Valid user gets succesfully created', async () => {
    const usersAtStart = await db.getDocuments("User")
    await _.postOne(null, validUser, 201)
  
    const usersAtEnd = await db.getDocuments("User")
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
  
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(validUser.username)
  })
  
  test('Creation fails when username is already taken', async () => {
    const usersAtStart = await db.getDocuments("User")
  
    const user = {
      username: "Peach",
      password: "Itsame"
    }
  
    await _.postOne(null, user, 400)
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
  
    await _.postOne(null, missingUsername, 400)
      .then((res) => expect(res.body.error).toContain("`username` is required"))
  
    await _.postOne(null, missingPassword, 400)
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
  
    await _.postOne(null, shortUsername, 400)
      .then((res) => expect(res.body.error).toContain("is shorter than the minimum allowed"))
  
    await _.postOne(null, shortPassword, 400)
      .then((res) => expect(res.body.error).toContain("password must be at least 3 characters"))
  
    const usersAtEnd = await db.getDocuments("User")
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('Created user has skills array', async () => {
    await _.postOne(null, validUser, 201)
      .then((res) => expect(res.body.skills).toEqual([]))
  })

})

describe('Deleting User', () => {

  test('User gets succesfully deleted', async () => {
    const usersAtStart = await db.getDocuments("User")

    await _.deleteOne(usersAtStart[0].id, null, 204)

    const usersAfterDeletion = await db.getDocuments("User")
    expect(usersAfterDeletion.length).toBe(usersAtStart.length - 1)
  })
  
  test('When user is deleted, associated skills and battles get deleted', async () => {
    const usersAtStart = await db.getDocuments("User")

    await _.deleteOne(usersAtStart[0].id, null, 204)

    const skillsAfterDelete = await db.getDocumentsBy({user: usersAtStart[0].id}, "Skill")
    expect(skillsAfterDelete.length).toBe(0)

    const battles = await db.getDocumentsBy({skill: skills[0]._id}, "Battle")
    expect(battles.length).toBe(0)
  })
})

afterAll(() => {
  mongoose.connection.close()
})