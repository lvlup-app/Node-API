const requestHelper = (api, baseUrl) => {

  const getAll = async (token, status) => {
    return await api
      .get(baseUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(status)
  }

  const getOne = async (id, token, status) => {
    return await api
      .get(`${baseUrl}/${id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(status)
  }
  
  const postOne = async (token, data, status) => {
    return await api
      .post(baseUrl)
      .set('Authorization', 'bearer ' + token)
      .send(data)
      .expect(status)
  }
  
  const deleteOne = async (id, token, status) => {
    return await api
      .delete(`${baseUrl}/${id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(status)
  }

  return {
    getAll,
    getOne,
    postOne,
    deleteOne
  }
}

module.exports = requestHelper