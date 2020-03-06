const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const testData = require('./test_data')
const requestHelper = require('./request_helper')
const db = require('./db_helper')

const { skills, battles, user, token, wrongToken } = testData
const skill = skills[0]

const baseUrl = `/skills/${skill._id}/battles`
const _ = requestHelper(api, baseUrl)

beforeAll(async () => {
  await db.initOne(skill, "Skill")
  await db.initOne(user, "User")
})

beforeEach(async () => {
  await db.initAll(battles, "Battle")
})

describe('Returning Battles', () => {

  test('Only logged in users can access battles', async () => {
    await _.getAll(null, 401)
      .then(res => expect(res.body.error).toContain("invalid token"))
  })
  
  test('Only authorized user can access battles', async () => {
    await _.getAll(wrongToken, 401)
      .then(res => expect(res.body.error).toContain("Access denied"))
  })

  test('Unique identifier property of a battle is named id', async () => {
    await _.getAll(token, 200)
      .then(res => expect(res.body[0].id).toBeDefined())
  })

  test('Battle has skill property', async () => {
    await _.getAll(token, 200)
      .then(res => expect(res.body[0].skill).toBeDefined())
  })

  test('All battles are returned', async () => {
    await _.getAll(token, 200)
      .then(res => expect(res.body.length).toBe(battles.length))
  })

  test('Battle can only be shown for authorized user', async () => {
    await _.getOne(battles[0]._id, wrongToken, 401)
      .then((res) => expect(res.body.error).toContain("Access denied"))
  })

  test('A single battle is returned', async () => {
    await _.getOne(battles[0]._id, token, 200)
      .then((res) => expect(res.body.id).toEqual(battles[0]._id))
  })
})

describe('Adding Battles', () => {
  const validBattle = {
    description: "Bug hunting",
    xp: 30,
  }

  test('A valid battle can be added', async () => {
    await _.postOne(token, validBattle, 201)
      .then(res => expect(res.body.description).toEqual(validBattle.description))

    const battlesAfterCreation = await db.getDocuments("Battle")
    expect(battlesAfterCreation.length).toBe(battles.length + 1)
  })

  test('Battles can only be added by authorized user', async () => {
    await _.postOne(wrongToken, validBattle, 401)
      .then(res => expect(res.body.error).toContain("Access denied"))

    const battlesAfterRequest = await db.getDocuments("Battle")
    expect(battlesAfterRequest.length).toBe(battles.length)
  })

  test('Battle is referencing right skill', async () => {
    await _.postOne(token, validBattle, 201)
      .then(res => expect(res.body.skill).toEqual(skill._id))
  })

  test('Referenced skill is listing new battle', async () => {
    const response = await _.postOne(token, validBattle, 201)

    const updatedSkill = await db.getDocument(skill._id, "Skill")
    expect(updatedSkill.battles).toContain(response.body.id)
  })

  test('Missing description results in status code 400', async () => {
    const battle = {
      xp: 30
    }

    await _.postOne(token, battle, 400)
  })

  test('Missing xp results in status code 400', async () => {
    const battle = {
      description: "Bug hunting"
    }

    await _.postOne(token, battle, 400)
  })
})

describe('Deleting Battles', () => {

  test('Battles can only be deleted by authorized user', async () => {
    const battles = await db.getDocuments("Battle")
    const battle = battles[0]

    await _.deleteOne(battle.id, wrongToken, 401)
      .then(res => expect(res.body.error).toContain("Access denied"))

    const battlesAfterDeletion = await db.getDocuments("Battle")
    expect(battlesAfterDeletion.length).toBe(battles.length)
  })

  test('Battle gets succesfully deleted', async () => {
    const battles = await db.getDocuments("Battle")
    const battle = battles[0]

    await _.deleteOne(battle.id, token, 204)

    const battlesAfterDeletion = await db.getDocuments("Battle")
    const ids = battlesAfterDeletion.map(battle => battle.id)

    expect(battlesAfterDeletion.length).toBe(battles.length - 1)
    expect(ids).not.toContain(battle.id)
  })

  test('Battle reference in associated skill gets deleted', async () => {
    const battles = await db.getDocuments("Battle")
    const battle = battles[0]

    await _.deleteOne(battle.id, token, 204)

    const updatedSkill = await db.getDocument(battle.skill, "Skill")
    expect(updatedSkill.battles).not.toContain(battle.id)
  })
})

afterAll(() => {
  mongoose.connection.close()
})