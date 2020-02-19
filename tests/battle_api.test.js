const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Battle = require('../models/battle')
const Skill = require('../models/skill')

const skill = {
  _id: "5a422a851b54a676234d17f7",
  name: "JavaScript",
  max_lvl: 20,
  curr_lvl: 8,
  curr_xp: 0,
  __v: 0,
  battles: [
    "5e4c614a842d0ee0f388a0b0",
    "5e4c614a842d0ee0f388a0b1",
    "5e4c614a842d0ee0f388a0b2"
  ]
}

const initialBattles = [
  {
    _id: "5e4c614a842d0ee0f388a0b0",
    description: "Coding challenge",
    xp: 20,
    skill: "5a422a851b54a676234d17f7"
  },
  {
    _id: "5e4c614a842d0ee0f388a0b1",
    description: "Spring tutorial",
    xp: 50,
    skill: "5a422a851b54a676234d17f7"
  },
  {
    _id: "5e4c614a842d0ee0f388a0b2",
    description: "30 min practice",
    xp: 10,
    skill: "5a422a851b54a676234d17f7"
  }
]

const basUrl = `/skills/${skill._id}/battles`

beforeAll(async () => {
  await Skill.deleteMany({})
  const newSkill = new Skill(skill)
  await newSkill.save()
})

beforeEach(async () => {
  await Battle.deleteMany({})

  let promiseArray = initialBattles.map(async (battle) => { 
    let newBattle = new Battle(battle)
    await newBattle.save()
  })

  await Promise.all(promiseArray)
})

describe('Returning Battles', () => {
  
  test('Unique identifier property of a battle is named id', async () => {
    const response = await api.get(`/skills/${skill._id}/battles`)
    expect(response.body[0].id).toBeDefined()
  })

  test('Battle has skill property', async () => {
    const response = await api.get(`/skills/${skill._id}/battles`)
    expect(response.body[0].skill).toBeDefined()
  })

  test('All battles are returned', async () => {
    const response = await api.get(`/skills/${skill._id}/battles`)
    expect(response.body.length).toBe(initialBattles.length)
  })

  test('A single battle is returned', async () => {
    await api
      .get(`/skills/${skill._id}/battles/${initialBattles[0]._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect((res) => { res.body.id = initialBattles[0]._id })
  })
})

describe('Adding Battles', () => {

  test('A valid battle can be added', async () => {
    const newBattle = {
      description: "Bug hunting",
      xp: 30,
    }

    await api
      .post(basUrl)
      .send(newBattle)
      .expect(201)
      .expect('Content-Type', /application\/json/)
      .expect(res => { 
        res.body.description = newBattle.description
      })

    const response = await api.get(basUrl)
    expect(response.body.length).toBe(initialBattles.length + 1)
  })

  test('Battle is referencing right skill', async () => {
    const newBattle = {
      description: "Building a project",
      xp: 80
    }

    await api
      .post(basUrl)
      .send(newBattle)
      .expect(res => { res.body.skill = skill._id })
  })

  test('Referenced skill is listing new battle', async () => {
    const newBattle = {
      description: "Bug hunting",
      xp: 30,
    }

    const response = await api.post(basUrl).send(newBattle)

    const updatedSkill = await Skill.findOne({_id: skill._id})
    // !
    const battleIds = updatedSkill.battles.map(battle => String(battle))
    expect(battleIds).toContain(response.body.id)
  })

  test('Missing description results in status code 400', async () => {
    const newBattle = {
      xp: 30
    }

    await api
      .post(basUrl)
      .send(newBattle)
      .expect(400)
  })

  test('Missing xp results in status code 400', async () => {
    const newBattle = {
      description: "Bug hunting"
    }

    await api
      .post(basUrl)
      .send(newBattle)
      .expect(400)
  })

})

describe('Deleting Battles', () => {

  test('Battle gets succesfully deleted', async () => {
    const battles = await Battle.find({})
    const battle = battles[0].toJSON()

    await api
      .delete(`${basUrl}/${battle.id}`)
      .expect(204)

    const battlesAfterDeletion = await Battle.find({})
    const ids = battlesAfterDeletion.map(battle => battle.toJSON().id)

    expect(battlesAfterDeletion.length).toBe(battles.length - 1)
    expect(ids).not.toContain(battle.id)
  })

  test('Battle reference in associated skill gets deleted', async () => {
    const battles = await Battle.find({})
    const battle = battles[0].toJSON()

    await api.delete(`${basUrl}/${battle.id}`)

    const updatedSkill = await Skill.findOne({_id: battle.skill})
    const battleIds = updatedSkill.battles.map(b => String(b))

    expect(battleIds).not.toContain(battle.id)
  })

})

afterAll(() => {
  mongoose.connection.close()
})

// populate?