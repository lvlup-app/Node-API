const battlesRouter = require('express').Router()
const {getAll, getBattle, createBattle, deleteBattle } = require('../helpers/battles')

battlesRouter.get('/:skillId/battles', async (request, response) => {
  const battles = await getAll(request.params.skillId)
  response.json(battles)
})

battlesRouter.get('/:skillId/battles/:id', async (request, response) => {
  const battle = await getBattle(request.params.id)
  response.json(battle)
})

battlesRouter.post('/:skillId/battles/', async (request, response) => {
  try{
    const savedBattle = await createBattle(request.body, request.params.skillId)
    response.status(201).json(savedBattle)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

battlesRouter.delete('/:skillId/battles/:id', async ({params}, response) => {
  await deleteBattle(params.skillId, params.id)
  response.status(204).end()
})

module.exports = battlesRouter