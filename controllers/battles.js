const battlesRouter = require('express').Router()
const helpers = require('../helpers/battles')

battlesRouter.get('/:skillId/battles', async (request, response) => {
  const battles = await helpers.getBattles(request.params.skillId)
  response.json(battles)
})

battlesRouter.get('/:skillId/battles/:id', async (request, response) => {
  const battle = await helpers.getBattle(request.params.id)
  response.json(battle)
})

battlesRouter.post('/:skillId/battles/', async (request, response) => {
  try{
    const savedBattle = await helpers.createBattle(request.body, request.params.skillId)
    response.status(201).json(savedBattle)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

battlesRouter.delete('/:skillId/battles/:id', async ({params}, response) => {
  await helpers.deleteBattle(params.id, params.skillId)
  response.status(204).end()
})

module.exports = battlesRouter