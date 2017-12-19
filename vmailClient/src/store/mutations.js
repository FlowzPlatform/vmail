export default {
	SET_USER (state, user) {
    state.user = user
  },
  SET_SELEMAIL (state, selectedEmail) {
    state.selectedEmail = selectedEmail
  },
  SET_EMAILGROUP (state, emailgroup) {
    state.emailgroup = emailgroup
  },
  SET_SUBJECTLIST (state, subjects) {
    state.subjectList = subjects
  },
  SET_CONVERSATION (state, conversation) {
    state.conversation = conversation
  }
}