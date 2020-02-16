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
    curr_xp: 30,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    name: "Java",
    max_lvl: 20,
    curr_lvl: 2,
    curr_xp: 0,
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

// return type is JSON

// all skills are returned

// unique identifier property of a blog is named id

// valid skill can be added

// if curr_xp missing, defaults to 0

// if curr_lvl is missing, defaults to 0

// if name or mx_lvl are missing, status code 400

// skill gets deleted

// skill gets updated


// battles are correctly associated