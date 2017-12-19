import axios from 'axios'
import authentication from '@/api/authentication'
import microservices from '@/api/microservices'

export default {
  authenticate ({ commit }, authToken) {
    return authentication.userdetail(authToken)
  },
  async getConversation (mId,sId) {
    return await microservices.getConversation(mId,sId)
  }
}