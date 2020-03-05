const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Battle = require('../models/battle')
const Skill = require('../models/skill')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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

const user = {
  _id: "5b52d425d2eb641aae880f50",
  username: "Peach",
  password: "Itsame"
}

const token = jwt.sign({
  username: user.username,
  id: user._id,
  }, process.env.SECRET
)

const basUrl = `/skills/${skill._id}/battles`

beforeAll(async () => {
  await Skill.deleteMany({})
  const newSkill = new Skill(skill)
  await newSkill.save()

  await User.deleteMany({})
  const newUser = new User(user)
  newUser.save()
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

  test('Only logged in users can access battles', async () => {
    await api
      .get(`/skills/${skill._id}/battles`)
      .expect(500)
      // check error message
  })
  
  test('Unique identifier property of a battle is named id', async () => {
    await api
      .get(`/skills/${skill._id}/battles`)
      .set('Authorization', 'bearer ' + token)
      .then(res => expect(res.body[0].id).toBeDefined())
  })

  test('Battle has skill property', async () => {
    await api
      .get(`/skills/${skill._id}/battles`)
      .set('Authorization', 'bearer ' + token)
      .then(res => expect(res.body[0].skill).toBeDefined())
  })

  test('All battles are returned', async () => {
    await api
      .get(`/skills/${skill._id}/battles`)
      .set('Authorization', 'bearer ' + token)
      .then(res => expect(res.body.length).toBe(initialBattles.length))
  })

  test('A single battle is returned', async () => {
    await api
      .get(`/skills/${skill._id}/battles/${initialBattles[0]._id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => expect(res.body.id).toEqual(initialBattles[0]._id))
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
      .set('Authorization', 'bearer ' + token)
      .send(newBattle)
      .expect(201)
      .expect('Content-Type', /application\/json/)
      .then(res => expect(res.body.description).toEqual(newBattle.description))

    const battles = await Battle.find({})
    expect(battles.length).toBe(initialBattles.length + 1)
  })

  test('Battle is referencing right skill', async () => {
    const newBattle = {
      description: "Building a project",
      xp: 80
    }

    await api
      .post(basUrl)
      .set('Authorization', 'bearer ' + token)
      .send(newBattle)
      .then(res => expect(res.body.skill).toEqual(skill._id))
  })

  test('Referenced skill is listing new battle', async () => {
    const newBattle = {
      description: "Bug hunting",
      xp: 30,
    }

    const response = await api
      .post(basUrl)
      .set('Authorization', 'bearer ' + token)
      .send(newBattle)

    const updatedSkill = await Skill.findById(skill._id)

    const battleIds = updatedSkill.battles.map(battle => String(battle))
    expect(battleIds).toContain(response.body.id)
  })

  test('Missing description results in status code 400', async () => {
    const newBattle = {
      xp: 30
    }

    await api
      .post(basUrl)
      .set('Authorization', 'bearer ' + token)
      .send(newBattle)
      .expect(400)
  })

  test('Missing xp results in status code 400', async () => {
    const newBattle = {
      description: "Bug hunting"
    }

    await api
      .post(basUrl)
      .set('Authorization', 'bearer ' + token)
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
      .set('Authorization', 'bearer ' + token)
      .expect(204)

    const battlesAfterDeletion = await Battle.find({})
    const ids = battlesAfterDeletion.map(battle => battle.toJSON().id)

    expect(battlesAfterDeletion.length).toBe(battles.length - 1)
    expect(ids).not.toContain(battle.id)
  })

  test('Battle reference in associated skill gets deleted', async () => {
    const battles = await Battle.find({})
    const battle = battles[0].toJSON()

    await api.delete(`${basUrl}/${battle.id}`).set('Authorization', 'bearer ' + token)

    const updatedSkill = await Skill.findById(battle.skill)
    const battleIds = updatedSkill.battles.map(b => String(b))

    expect(battleIds).not.toContain(battle.id)
  })

})

afterAll(() => {
  mongoose.connection.close()
})