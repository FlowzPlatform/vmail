'use strict'

const { send,buffer,text,json,createError } = require('micro')
const { router,get,post,options } = require('microrouter')
const rethinkDBObj = require('rethinkdb')
const jwtAuth = require('micro-jwt-auth')
const cors = require('micro-cors')()
let config = require('config')
let fs = require('fs')
let Promise = require('promise')
const rp = require('request-promise')

/*------------------------------------------------ ENV VAR SETTINGS ------------------------------------------*/
let env_rhost = process.env.rhost
let env_rport = process.env.rport
let env_rdb = process.env.rdb
let env_senecaUrl = process.env.senecaurl
let env_privateKey = process.env.privatekey
let rhost,rport,rdb,senecaUrl,privateKey

/*------------------------------------------------ RETHINK SETTINGS ------------------------------------------*/
if(process.env.rhost)
  rhost = env_rhost
else
  rhost = config.rhost
if(process.env.rport)
  rport = env_rport
else
  rport = config.rport
if(process.env.rdb)
  rdb = env_rdb
else
  rdb = config.rdb

/*------------------------------------------------ SENECA SETTINGS ------------------------------------------*/
if(process.env.senecaurl)
  senecaUrl = env_senecaUrl
else
  senecaUrl = config.senecaUrl

/*------------------------------------------------ PRIVATE-KEY SETTINGS -------------------------------------*/
if(process.env.privatekey)
  privateKey = env_privateKey
else
  privateKey = config.privateKey

/*------------------------------------------------ RETHINK CONNECTION ---------------------------------------*/
let rethinkConnection = null
rethinkDBObj.connect({ host:rhost, port:rport, db:rdb }, function(err, conn) {
  if (err) throw err
  rethinkConnection = conn
})

/*------------------------------------------------ DATE FORMAT FUNCTION -------------------------------------*/
function getDateFormat(date) {
  let year = date.getFullYear()
  let month = date.getMonth()+1
  let dt = date.getDate()

  if (dt < 10)
    dt = '0' + dt
  if (month < 10)
    month = '0' + month
  return {year:parseInt(year),month:parseInt(month),dt:parseInt(dt)}
}

/*------------------------------------------------ GET EMAILDATA BY RID -------------------------------------*/
async function getParentEmailData(parentId) {
  return new Promise(async(resolve, reject) => {
    await rethinkDBObj.table('emails')
    .filter({ id: parentId })
    .run(rethinkConnection, function(err, cursor) {
      cursor.toArray(function(err, result) {
        resolve(result[0])
      })
    })
  })
}

/*------------------------------------------------ SAVE EMAIL-IDS -------------------------------------------*/
function saveEmailIds(emailId) {
  let emailObj = {
    'emailid' : emailId,
    'created' : rethinkDBObj.ISO8601(new Date().toISOString())
  }
  rethinkDBObj.table('emailIds')
    .filter({'emailid':emailObj.emailid})
    .run(rethinkConnection, function(err, cursor) {
    cursor.toArray(function(err, result) {
      if(result.length<1){
        rethinkDBObj.table('emailIds').insert(emailObj).run(rethinkConnection)
      }
    })
  })
}

/*---------------------------------------------- SAVE SUBJECTS ---------------------------------------------*/
function saveSubjects(subObj) {
  let subject = {
    'emailId' : subObj.from,
    'messageId' : subObj.messageId,
    'subject' : subObj.subject,
    'created' : rethinkDBObj.ISO8601(new Date().toISOString())
  }
  rethinkDBObj.table('emailSubjects')
  .insert(subject).run(rethinkConnection)
}

/*------------------------------------------------ SAVE CALEDAR EVENTS -------------------------------------*/
function saveCalendarEvents(details) {
  let calObj = {
    emailId : details.from,
    date : rethinkDBObj.ISO8601(details.icalStartDate+'T'+details.icalStartTime+'Z'),
    summary : details.icalSummary
  }
  rethinkDBObj.table('calEvents')
  .insert(calObj).run(rethinkConnection)
}

/*------------------------------------------------ UNREAD FLAG ---------------------------------------------*/
function readSubject(mid,sid) {
  rethinkDBObj.table('emailSubjects')
  .filter(rethinkDBObj.row('messageId').eq(mid).and(rethinkDBObj.row('emailId').eq(sid)))
  .update({ 'unread' : false })
  .run(rethinkConnection)
}

/*------------------------------------------------ READ EMAIL-ID -------------------------------------------*/
function readEmailId(mid,sid) {
  rethinkDBObj.table('emails')
  .filter(rethinkDBObj.row('headers')('references')
  .contains(mid)
  .or(rethinkDBObj.row('headers')('messageId')
  .eq(mid)))
  .filter(
    rethinkDBObj.row('rcpTo').contains(sid)
    .and(rethinkDBObj.row('received').eq(true))
    .and(rethinkDBObj.row('read').eq(false))
    .or(rethinkDBObj.row('data')('from').eq(sid))
  ).count()
  .run(rethinkConnection, function(err, cursor) {
    let count = cursor
    rethinkDBObj.table('emailIds')
    .filter({'emailid' : sid})
    .run(rethinkConnection, function(err, cursor) {
      cursor.toArray(function(err, result) {
        if(result[0].unreadCount && result[0].unreadCount>0){
          rethinkDBObj.table('emailIds')
          .filter({'emailid' : sid})
          .update({'unreadCount' : rethinkDBObj.row('unreadCount').sub(count)})
          .run(rethinkConnection)
        }
      })
    })
  })
}

/*------------------------------------------------ UPDAET EMAILS -------------------------------------------*/
function updateEmails(mid,sid) {
  rethinkDBObj.table('emails')
  .filter(rethinkDBObj.row('headers')('references')
  .contains(mid)
  .or(rethinkDBObj.row('headers')('messageId')
  .eq(mid)))
  .filter(
    rethinkDBObj.row('rcpTo').contains(sid)
    .or(rethinkDBObj.row('data')('from').eq(sid))
  )
  .orderBy(rethinkDBObj.asc('created'))
  .update(rethinkDBObj.row('read').eq(true))
  .run(rethinkConnection)
}

/*---------------------------------------------- EMAIL GROUP SERVICE ---------------------------------------*/
const emailGroups = cors(jwtAuth(privateKey)(async(req, res) => {
  await rethinkDBObj.db('virtualEMail').table('emailIds')
  .orderBy(rethinkDBObj.asc('created'))
  .run(rethinkConnection, function(err, cursor) {
    cursor.toArray(function(err, result) {
      send(res, 200, result)
    })
  })
}))

/*---------------------------------------------- EMAIL SUBJECT SERVICE -------------------------------------*/
const emailSubjects = cors(jwtAuth(privateKey)(async(req, res) => {
  await rethinkDBObj.table('emailSubjects')
  .filter(rethinkDBObj.row('emailId').eq(req.query.eid))
  .orderBy(rethinkDBObj.asc('created'))
  .run(rethinkConnection, function(err, cursor) {
    cursor.toArray(function(err, result) {
      send(res, 200, result)
    })
  })
}))

/*---------------------------------------------- EMAIL CONVERSATION SERVICE --------------------------------*/
const emailConversation = cors(jwtAuth(privateKey)(async(req, res) => {
  updateEmails(req.query.mid,req.query.sid);
  await rethinkDBObj.table('emails')
  .filter(rethinkDBObj.row('headers')('references')
  .contains(req.query.mid)
  .or(rethinkDBObj.row('headers')('messageId')
  .eq(req.query.mid)))
  .filter(
    rethinkDBObj.row('rcpTo').contains(req.query.sid)
    .or(rethinkDBObj.row('data')('from').eq(req.query.sid))
  )
  .orderBy(rethinkDBObj.asc('created'))
  .run(rethinkConnection, function(err, cursor) {
    cursor.toArray(function(err, result) {
      readSubject(req.query.mid,req.query.sid);
      readEmailId(req.query.mid,req.query.sid);
      send(res, 200, result)
    })
  })
}))

/*---------------------------------------------- SEND EMAIL SERVICE ---------------------------------------*/
const sendEmail = cors(jwtAuth(privateKey)(async(req, res) => {
  req = await json(req)
  let inReplyTo = ''
  let references = []
  if(req.to!='' && req.to!=undefined){
    //----------------------  save email-ids
    saveEmailIds(req.from)
    //---------------------- set reply to email-id
    req['replyTo'] = req.from

    req['calEvent'] = false
    if(req.cc == undefined)
      req['cc'] = []
    if(req.bcc == undefined)
      req['bcc'] = []
    if(req.subject == undefined)
      req['subject'] = 'untitled subject'
    if(req.body == undefined)
      req['body'] = 'null body'

    //---------------------- set inReplyTo and references of parent email
    if (req.parentId != '' && req.parentId != undefined) {
      let parentEmailData = await getParentEmailData(req.parentId);
      req['inReplyTo'] = parentEmailData.headers.messageId
      if (parentEmailData.headers.references == undefined) {
        req.references = []
        req.references.push(parentEmailData.headers.messageId)
      } else {
        req.references = parentEmailData.headers.references.concat(parentEmailData.headers.messageId)
      }
      inReplyTo = req.inReplyTo
      references = req.references
    }
    //---------------------- send email using seneca service
    let response = {
      method: 'POST',
      url: senecaUrl+'/email/send',
      json: true,
      body: req
    }
    //----------------------  get response of seneca service
    const emailSendResponse = await rp(response);
    //----------------------  save email subjects
    if (req.parentId == '' || req.parentId == undefined)
      saveSubjects({'from':req.from,'messageId':emailSendResponse.response.messageId,'subject':req.subject})
    //----------------------  save calendar events
    if(req.icalStartDate!='' && req.icalStartDate!=undefined && req.icalStartDate!='Invalid date'
      && req.icalStartTime!='' && req.icalStartTime!=undefined && req.icalStartTime!='Invalid time'){
      saveCalendarEvents(req)
      req.calEvent = true
    }
    //----------------------  insert email data
    let rcpTo = req.to.concat(req.cc).concat(req.bcc)
    await rethinkDBObj.table('emails')
    .insert({
      'created' : rethinkDBObj.ISO8601(new Date().toISOString()),
      // 'attachment' : false,
      'received' : false,
      // 'read': true,
      'calEvent' : req.calEvent,
      'data' : {
        'from' : req.from,
        'to' : req.to,
        'cc' : req.cc,
        'subject' : req.subject,
        'body' : req.body
      },
      'headers' : {
        'messageId' : emailSendResponse.response.messageId,
        'inReplyTo' : inReplyTo,
        'references' : references
      },
      'rcpTo' : rcpTo
    })
    .run(rethinkConnection)
    send(res, 200, {'success':'email sent successfully'})
  }
  else{
    send(res, 200, {'error':'Atleast one recipient is required.'})
  }
}))

/*---------------------------------------------- REQ ICAL EVENS SERVICE ------------------------------------*/
const requestIcalEvents = cors(jwtAuth(privateKey)(async(req, res) => {
  let startDate = getDateFormat(new Date(req.query.start))
  let startEnd = getDateFormat(new Date(req.query.end))
  let emailId = req.query.email
  await rethinkDBObj.table('calEvents')
  .filter({'emailId':emailId})
  .filter(
    rethinkDBObj.row('date')
      .during(rethinkDBObj.time(startDate.year,startDate.month,startDate.dt,"Z"), rethinkDBObj.time(startEnd.year,startEnd.month,startEnd.dt,"Z"))
  )
  .map( function(doc) { return {
    title:doc('summary'),
    start:doc('date')
  }})
  .run(rethinkConnection, function(err, cursor) {
    if (err) throw err
    cursor.toArray(function(err, response) {
      if (err) throw err
      send(res,200,response)
    })
  })
}))

/*---------------------------------------------- SWAGGER DOCS SERVICE -------------------------------------*/
const docs = cors(async(req, res) => {
  send(res,200,'response')
})

/*---------------------------------------------- NOT FOUND SERVICE ----------------------------------------*/
const notfound = cors(jwtAuth(privateKey)((req, res) => send(res, 200,"")))

/*---------------------------------------------- ROUTES ---------------------------------------------------*/
module.exports = router(
  get('/emailGroups', emailGroups),
  get('/emailSubjects', emailSubjects),
  get('/emailConversation', emailConversation),
  post('/sendEmail', sendEmail),
  get('/requestIcalEvents', requestIcalEvents),
  get('/docs', docs),
  options('/*', notfound)
)
