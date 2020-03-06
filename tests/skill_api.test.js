const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const jwt = require('jsonwebtoken')
const Skill = require('../models/skill')
const Battle = require('../models/battle')
const User = require('../models/user')

const initialSkills = [
  {
    _id: "5a422a851b54a676234d17f7",
    name: "JavaScript",
    max_lvl: 20,
    curr_lvl: 8,
    curr_xp: 0,
    __v: 0,
    battles: [
      "5f4c614a842d0ee0f388a0b0",
      "5f4c614a842d0ee0f388a0b1"
    ],
    user: "5b52d425d2eb641aae880f50"
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    name: "Java",
    max_lvl: 20,
    curr_lvl: 2,
    curr_xp: 30,
    __v: 0,
    user: "5b52d425d2eb641aae880f50"
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    name: "Guitar",
    max_lvl: 15,
    curr_lvl: 1,
    curr_xp: 5,
    __v: 0,
    user: "5b52d425d2eb641aae880f50"
  },
  {
    _id: "5a422a851b54a676234d17f6",
    name: "Running",
    max_lvl: 15,
    curr_lvl: 1,
    curr_xp: 5,
    __v: 0,
    user: "5b52d425d2eb641aae880f55"
  }
]

const battles = [
  {
    _id: "5f4c614a842d0ee0f388a0b0",
    description: "Bug hunting",
    xp: 20,
    skill: "5a422a851b54a676234d17f7"
  },
  {
    _id: "5f4c614a842d0ee0f388a0b1",
    description: "Coding challenge",
    xp: 30,
    skill: "5a422a851b54a676234d17f7"
  }
]

const user = {
  _id: "5b52d425d2eb641aae880f50",
  username: "Peach",
  password: "Itsame",
  skills: [
    "5a422a851b54a676234d17f7",
    "5a422aa71b54a676234d17f8",
    "5a422b3a1b54a676234d17f9"
  ]
}

const token = jwt.sign({
  username: user.username,
  id: user._id,
  }, process.env.SECRET
)

const wrongToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik1hcmlvbiIsImlkIjoiNWU2MWYzYzJjYWRiZWE4MTRhMzFjNTZkIiwiaWF0IjoxNTgzNDc3NzA0fQ.dJeUKAWZ9QN7hmphjG5h21Z4WLuOCmQ56E6b_mYQGMk"

beforeAll(async () => {
  await Battle.deleteMany({})

  let promiseArray = battles.map(async (battle) => { 
    let newBattle = new Battle(battle)
    await newBattle.save()
  })

  await Promise.all(promiseArray)

  await User.deleteMany({})
  const newUser = new User(user)
  newUser.save()
})

beforeEach(async () => {
  await Skill.deleteMany({})

  let promiseArray = initialSkills.map(async (skill) => { 
    let newSkill = new Skill(skill)
    await newSkill.save()
  })

  await Promise.all(promiseArray)
})

describe('Returning Skills', () => {

  test('Logged user can only see their own skills', async () => {
    const response = await api
      .get('/skills')
      .set('Authorization', 'bearer ' + token)

      const skillNames = response.body.map((skill) => skill.name)
      expect(skillNames).not.toContain(initialSkills[initialSkills.length-1].name)
  })

  test('Unique identifier property of a skill is named id', async () => {
    const response = await api
      .get('/skills')
      .set('Authorization', 'bearer ' + token)
      
    expect(response.body[0].id).toBeDefined()
  })
  
  test('All skills are returned', async () => {
    const response = await api
      .get('/skills')
      .set('Authorization', 'bearer ' + token)

    expect(response.body.length).toBe(initialSkills.length - 1)
  })

  test('Only the creator of a skill can access it', async () => {
    await api
      .get(`/skills/${initialSkills[0]._id}`)
      .set('Authorization', 'bearer ' + wrongToken)
      .expect(401)
      .then(res => expect(res.body.error).toContain("Access denied"))
  })

  test('A single skill is returned', async () => {
    await api
      .get(`/skills/${initialSkills[0]._id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => expect(res.body.id).toEqual(initialSkills[0]._id ))
  })
})

describe('Adding Skills', () => {

  test('Only logged in users can add skills', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20,
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(skill)
      .expect(401)
      .then(res => expect(res.body.error).toContain("invalid token"))

      const skills = await Skill.find({})
      expect(skills.length).toBe(initialSkills.length)
  })

  test('A valid skill can be added', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20,
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const skills = await Skill.find({})
    const skillNames = skills.map((skill) => skill.name)

    expect(skills.length).toBe(initialSkills.length + 1)
    expect(skillNames).toContain(skill.name)
  })

  test('Created skill has battles array', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20,
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)
      .then(res => expect(res.body.battles).toEqual([]))
  })

  test('Created skill has user reference', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20
    }

    await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)
      .then(res => expect(res.body.user).toEqual(user._id))
  })

  test('Referenced user is listing new skill', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20
    }

    const response = await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)

    const updatedUser = await User.findById(user._id)
    const skillIds = updatedUser.skills.map(skill => String(skill))
    expect(skillIds).toContain(response.body.id)
  })

  test('If current XP is missing, it defaults to 0', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20
    }

    const response = await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)

    expect(response.body.curr_xp).toBeDefined()
    expect(response.body.curr_xp).toEqual(0)
  })

  test('If current level is missing, it defaults to 0', async () => {
    const skill = {
      name: "Cooking",
      max_lvl: 20,
      curr_xp: 70
    }

    const response = await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)

    expect(response.body.curr_lvl).toBeDefined()
    expect(response.body.curr_lvl).toEqual(0)
  })

  test('Missing skill name results in status code 400', async () => {
    const skill = {
      curr_lvl: "5",
      max_lvl: 20,
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)
      .expect(400)
  })

  test('Missing max level results in status code 400', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(skill)
      .set('Authorization', 'bearer ' + token)
      .expect(400)
  })
})

describe('Modifying Skills', () => {

  test('Only creator of skill can delete it', async () => {
    const skills = await Skill.find({})
    const skill = skills[0].toJSON()

    await api
      .delete(`/skills/${skill.id}`)
      .set('Authorization', 'bearer ' + wrongToken)
      .expect(401)
      .then(res => expect(res.body.error).toContain("Access denied"))

    const skillsAfterDeletion = await Skill.find({})
    expect(skillsAfterDeletion.length).toBe(skills.length)
  })

  test('Skill gets succesfully deleted', async () => {
    const skills = await Skill.find({})
    const skill = skills[0].toJSON()

    await api
      .delete(`/skills/${skill.id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(204)

    const skillsAfterDeletion = await Skill.find({})
    expect(skillsAfterDeletion.length).toBe(skills.length - 1)
    
    const skillNames = skillsAfterDeletion.map(skill => skill.toJSON().name)
    expect(skillNames).not.toContain(skill.name)
  })

  test('When skill is deleted, all referenced battles are deleted', async () => {
    const skills = await Skill.find({})
    const skill = skills[0].toJSON()

    await api
      .delete(`/skills/${skill.id}`)
      .set('Authorization', 'bearer ' + token)

    const battlesAfterDelete = await Battle.find({})
    expect(battlesAfterDelete.length).toBe(0)
  })

  test('Skill can only be updated by its creator', async () => {
    const skills = await Skill.find({})
    const skill = skills[0].toJSON()
    const originalXp = skill.curr_xp
    skill.curr_xp = 40

    await api
      .put(`/skills/${skill.id}`)
      .send(skill)
      .set('Authorization', 'bearer ' + wrongToken)
      .expect(401)
      .then(res => expect(res.body.error).toContain("Access denied"))

    const updatedSkills = await Skill.find({})
    expect(updatedSkills[0].toJSON().curr_xp).toBe(originalXp)
  })

  test('Skill gets succesfully updated', async () => {
    const skills = await Skill.find({})
    let skill = skills[0].toJSON()
    skill.curr_xp = 40

    await api
      .put(`/skills/${skill.id}`)
      .send(skill)
      .set('Authorization', 'bearer ' + token)

    const updatedSkills = await Skill.find({})
    expect(updatedSkills[0].toJSON().curr_xp).toBe(40)
  })
})

afterAll(() => {
  mongoose.connection.close()
})