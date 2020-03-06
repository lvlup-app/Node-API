const jwt = require('jsonwebtoken')

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

const skills = [
  {
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
    battles: [],
    user: "5b52d425d2eb641aae880f50"
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    name: "Guitar",
    max_lvl: 15,
    curr_lvl: 1,
    curr_xp: 5,
    __v: 0,
    battles: [],
    user: "5b52d425d2eb641aae880f50"
  },
  {
    _id: "5a422a851b54a676234d17f6",
    name: "Running",
    max_lvl: 15,
    curr_lvl: 1,
    curr_xp: 5,
    __v: 0,
    battles: [],
    user: "5b52d425d2eb641aae880f55"
  }
]

const battles = [
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

module.exports = {
  user,
  token,
  wrongToken,
  skills,
  battles
}
