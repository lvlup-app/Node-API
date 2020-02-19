const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Skill = require('../models/skill')

const initialSkills = [
  {
    _id: "5a422a851b54a676234d17f7",
    name: "JavaScript",
    max_lvl: 20,
    curr_lvl: 8,
    curr_xp: 0,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    name: "Java",
    max_lvl: 20,
    curr_lvl: 2,
    curr_xp: 30,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    name: "Guitar",
    max_lvl: 15,
    curr_lvl: 1,
    curr_xp: 5,
    __v: 0
  }
]

beforeEach(async () => {
  await Skill.deleteMany({})

  let promiseArray = initialSkills.map(async (skill) => { 
    let newSkill = new Skill(skill)
    await newSkill.save()
  })

  await Promise.all(promiseArray)
})

describe('Returning Skills', () => {

  /* test('Skills are returned as JSON', async () => {
    api
      .get('/skills')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }) */

  test('Unique identifier property of a skill is named id', async () => {
    const response = await api.get('/skills')
    expect(response.body[0].id).toBeDefined()
  })
  
  test('All skills are returned', async () => {
    const response = await api.get('/skills')
    expect(response.body.length).toBe(initialSkills.length)
  })

  test('Skill has battles array', async () => {
    const response = await api.get('/skills')
    expect(response.body[0].battles).toBeDefined()
    expect(response.body[0].battles).toEqual([])
  })

  test('A single skill is returned', async () => {
    await api
      .get(`/skills/${initialSkills[0]._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect((res) => { res.body.id = initialSkills[0]._id })
  })

})

describe('Adding Skills', () => {

  test('A valid skill can be added', async () => {
    const newSkill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20,
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(newSkill)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/skills')
    const skillNames = response.body.map((skill) => skill.name)

    expect(response.body.length).toBe(initialSkills.length + 1)
    expect(skillNames).toContain(newSkill.name)
  })

  test('If current XP is missing, it defaults to 0', async () => {
    const newSkill = {
      name: "Cooking",
      curr_lvl: "5",
      max_lvl: 20
    }

    const response = await api.post('/skills').send(newSkill)
    expect(response.body.curr_xp).toBeDefined()
    expect(response.body.curr_xp).toEqual(0)
  })

  test('If current level is missing, it defaults to 0', async () => {
    const newSkill = {
      name: "Cooking",
      max_lvl: 20,
      curr_xp: 70
    }

    const response = await api.post('/skills').send(newSkill)
    expect(response.body.curr_lvl).toBeDefined()
    expect(response.body.curr_lvl).toEqual(0)
  })

  test('Missing skill name results in status code 400', async () => {
    const newSkill = {
      curr_lvl: "5",
      max_lvl: 20,
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(newSkill)
      .expect(400)
  })

  test('Missing max level results in status code 400', async () => {
    const newSkill = {
      name: "Cooking",
      curr_lvl: "5",
      curr_xp: 70
    }

    await api
      .post('/skills')
      .send(newSkill)
      .expect(400)
  })

})

describe('Modifying Skills', () => {

  test('Skill gets succesfully deleted', async () => {
    const skills = await Skill.find({})
    const skill = skills[0].toJSON()

    await api
      .delete(`/skills/${skill.id}`)
      .expect(204)

    const skillsAfterDeletion = await Skill.find({})
    expect(skillsAfterDeletion.length).toBe(skills.length - 1)
    
    const skillNames = skillsAfterDeletion.map(skill => skill.toJSON().name)
    expect(skillNames).not.toContain(skill.name)
  })

  test('Skill gets succesfully updated', async () => {
    const skills = await Skill.find({})
    let skill = skills[0].toJSON()
    skill.curr_xp = 40

    await api
      .put(`/skills/${skill.id}`)
      .send(skill)

    const updatedSkills = await Skill.find({})
    expect(updatedSkills[0].toJSON().curr_xp).toBe(40)
  })
})

afterAll(() => {
  mongoose.connection.close()
})


/* TO DO 
* battles get deleted after skill deletion!
* type and empty string restrictions
* test for custom error messages? --> write error handler middleware

* user access
*/