const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const testData = require('./test_data')
const requestHelper = require('./request_helper')
const db = require('./db_helper')

const { skills, battles, user, token, wrongToken } = testData
const baseUrl = '/skills'
const _ = requestHelper(api, baseUrl)

beforeAll(async () => {
  await db.initAll(battles, "Battle")
  await db.initOne(user, "User")
})

beforeEach(async () => {
  await db.initAll(skills, "Skill")
})

describe('Returning Skills', () => {

  test('Logged user can only see their own skills', async () => {
    const response = await _.getAll(token, 200)

    const skillNames = response.body.map((skill) => skill.name)
    expect(skillNames).not.toContain(skills[skills.length-1].name)
  })

  test('Unique identifier property of a skill is named id', async () => {
    await _.getAll(token, 200)
      .then(res => expect(res.body[0].id).toBeDefined())
  })
  
  test('All skills are returned', async () => {
    await _.getAll(token, 200)
      .then(res => expect(res.body.length).toBe(skills.length - 1))
  })

  test('Only the creator of a skill can access it', async () => {
    await _.getOne(skills[0]._id, wrongToken, 401)
      .then(res => expect(res.body.error).toContain("Access denied"))
  })

  test('A single skill is returned', async () => {
    await _.getOne(skills[0]._id, token, 200)
      .then((res) => expect(res.body.id).toEqual(skills[0]._id))
  })
})

describe('Adding Skills', () => {
  const validSkill = {
    name: "Cooking",
    curr_lvl: "5",
    max_lvl: 20,
    curr_xp: 70
  }

  test('Only logged in users can add skills', async () => {
    await _.postOne(null, validSkill, 401)
      .then(res => expect(res.body.error).toContain("invalid token"))

      const skillsAfterRequest = await db.getDocuments("Skill")
      expect(skillsAfterRequest.length).toBe(skills.length)
  })

  test('A valid skill can be added', async () => {
    await _.postOne(token, validSkill, 201)

    const skillsAfterCreation = await db.getDocuments("Skill")
    const skillNames = skillsAfterCreation.map((skill) => skill.name)

    expect(skillsAfterCreation.length).toBe(skills.length + 1)
    expect(skillNames).toContain(validSkill.name)
  })

  test('Created skill has battles array', async () => {
    await _.postOne(token, validSkill, 201)
      .then(res => expect(res.body.battles).toEqual([]))
  })

  test('Created skill has user reference', async () => {
    await _.postOne(token, validSkill, 201)
      .then(res => expect(res.body.user).toEqual(user._id))
  })

  test('Referenced user is listing new skill', async () => {
    const response = await _.postOne(token, validSkill, 201)

    const updatedUser = await db.getDocument(user._id, "User")
    expect(updatedUser.skills).toContain(response.body.id)
  })

  test('If current XP is missing, it defaults to 0', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20
    }

    await _.postOne(token, skill, 201)
      .then(res => {
        expect(res.body.curr_xp).toBeDefined()
        expect(res.body.curr_xp).toEqual(0)
      })
  })

  test('If current level is missing, it defaults to 0', async () => {
    const skill = {
      name: "Cooking",
      max_lvl: 20,
      curr_xp: 70
    }

    await _.postOne(token, skill, 201)
      .then(res => {
        expect(res.body.curr_lvl).toBeDefined()
        expect(res.body.curr_lvl).toEqual(0)
      })
  })

  test('Missing skill name results in status code 400', async () => {
    const skill = {
      curr_lvl: "5",
      max_lvl: 20,
      curr_xp: 70
    }

    await _.postOne(token, skill, 400)
  })

  test('Missing max level results in status code 400', async () => {
    const skill = {
      name: "Cooking",
      curr_lvl: "5",
      curr_xp: 70
    }

    await _.postOne(token, skill, 400)
  })
})

describe('Modifying Skills', () => {

  test('Only creator of skill can delete it', async () => {
    const skills = await db.getDocuments("Skill")
    const skill = skills[0]

    await _.deleteOne(skill.id, wrongToken, 401)
      .then(res => expect(res.body.error).toContain("Access denied"))

    const skillsAfterDeletion = await db.getDocuments("Skill")
    expect(skillsAfterDeletion.length).toBe(skills.length)
  })

  test('Skill gets succesfully deleted', async () => {
    const skills = await db.getDocuments("Skill")
    const skill = skills[0]

    await _.deleteOne(skill.id, token, 204)

    const skillsAfterDeletion = await db.getDocuments("Skill")
    expect(skillsAfterDeletion.length).toBe(skills.length - 1)
    
    const skillNames = skillsAfterDeletion.map(skill => skill.name)
    expect(skillNames).not.toContain(skill.name)
  })

  test('When skill is deleted, all referenced battles are deleted', async () => {
    const skills = await db.getDocuments("Skill")
    const skill = skills[0]

    await _.deleteOne(skill.id, token, 204)

    const battlesAfterDelete = await db.getDocuments("Battle")
    expect(battlesAfterDelete.length).toBe(0)
  })

  test('Skill can only be updated by its creator', async () => {
    const skills = await db.getDocuments("Skill")
    const skill = skills[0]
    const originalXp = skill.curr_xp
    skill.curr_xp = 40

    await api
      .put(`${baseUrl}/${skill.id}`)
      .send(skill)
      .set('Authorization', 'bearer ' + wrongToken)
      .expect(401)
      .then(res => expect(res.body.error).toContain("Access denied"))

    const updatedSkills = await db.getDocuments("Skill")
    expect(updatedSkills[0].curr_xp).toBe(originalXp)
  })

  test('Skill gets succesfully updated', async () => {
    const skills = await db.getDocuments("Skill")
    let skill = skills[0]
    skill.curr_xp = 40

    await api
      .put(`${baseUrl}/${skill.id}`)
      .send(skill)
      .set('Authorization', 'bearer ' + token)

    const updatedSkills = await db.getDocuments("Skill")
    expect(updatedSkills[0].curr_xp).toBe(40)
  })
})

afterAll(() => {
  mongoose.connection.close()
})