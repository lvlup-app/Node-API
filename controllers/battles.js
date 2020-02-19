const battlesRouter = require('express').Router()
const Battle = require('../models/battle')

battlesRouter.get('/:skillId/battles', async (request, response) => {
  const battles = await Battle.find({skill: request.params.skillId})
  response.json(battles)
})

battlesRouter.get('/:skillId/battles/:id', async (request, response) => {
  const battle = await Battle.find({_id: request.params.id})
  response.json(battle)
})

battlesRouter.post('/:skillId/battles/', async (request, response) => {
  try{
    const battle = new Battle({...request.body, skill: request.params.skillId})
    const savedBattle = await battle.save()

    response.status(201).json(savedBattle)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

battlesRouter.delete('/:skillId/battles/:id', async (request, response) => {
  await Battle.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = battlesRouter