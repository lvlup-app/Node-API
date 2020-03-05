const jwt = require('jsonwebtoken')

const tokenValidator = (request, response, next) => {
  const authorization = request.get('Authorization')
  let token

  if(authorization && authorization.toLowerCase().startsWith('bearer ')){
    token = authorization.substring(7)
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)

  if(!token || !decodedToken.id){
    return response.status(401).json({error: 'token missing or invalid'})
  }

  request.decoded = decodedToken
  next()
}

const errorHandler = (error, request, response, next) => {
  switch(error.name){
    case "ValidationError":
      return response.status(400).json({ error: error.message })
    case "JsonWebTokenError":
      return response.status(401).json({ error: 'invalid token' })
    case "AuthorizationError":
      return response.status(401).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  tokenValidator,
  errorHandler
}