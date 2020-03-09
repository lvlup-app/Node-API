/**
 * Initialize the helper with supertest and the request's base url
 * @param {*} api - supertest(app)
 * @param {string} baseUrl 
 */
const requestHelper = (api, baseUrl) => {
  /**
   * @param {string} token 
   * @param {number} status 
   */
  const getAll = async (token, status) => {
    return await api
      .get(baseUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(status)
  }

  /**
   * @param {string} id
   * @param {string} token 
   * @param {number} status 
   */
  const getOne = async (id, token, status) => {
    return await api
      .get(`${baseUrl}/${id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(status)
  }
  
  /**
   * @param {string} token 
   * @param {Object} data
   * @param {number} status 
   */
  const postOne = async (token, data, status) => {
    return await api
      .post(baseUrl)
      .set('Authorization', 'bearer ' + token)
      .send(data)
      .expect(status)
  }

  /**
   * @param {string} id
   * @param {string} token 
   * @param {number} status 
   */
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