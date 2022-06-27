module.exports.noUserTokenProvidedResponse = function(e,response){
  return response.status(401).json({error:e}).end()
}