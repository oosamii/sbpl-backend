const handleNotFound = (res, modelName, id) => {
  console.log(`Did not find ${modelName} for id ${id}`)
  return res.status(404).json({
    success: false,
    msg: `Did not find ${modelName} for id ${id}`,
  })
}

const handleAlreadyExists = (res, modelName, name) => {
  console.log(`Already existing ${modelName} for name ${name}`)
  return res.status(400).json({
    success: false,
    msg: `Already existing ${modelName} for name ${name}`,
  })
}

const handleErrorResponse = (res, error, msg = 'Internal Server Error') => {
  return res.status(500).json({
    success: false,
    error: error.message,
    msg,
  })
}

export { handleAlreadyExists, handleErrorResponse, handleNotFound }
