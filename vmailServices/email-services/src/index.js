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
const mime = require('mime')
const path = require('path')
let AWS = require('aws-sdk')
let zlib = require('zlib')

// const serve = require('serve')
// const server = serve(__dirname, {
//   port: 3001,
//   ignore: ['node_modules']
// })


/*------------------------------------------------ ENV VAR SETTINGS ------------------------------------------*/
let env_awsaccesskey = process.env.awsaccesskey
let env_awsprivatekey = process.env.awsprivatekey
let env_rhost = process.env.rhost
let env_rport = process.env.rport
let env_rdb = process.env.rdb
let env_rauth = process.env.rauth
let env_senecaUrl = process.env.senecaurl
let env_privateKey = process.env.privatekey
let rhost,rport,rdb,senecaUrl,privateKey,rauth

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
if(process.env.rauth)
  rauth = env_rauth
else
  rauth = config.rauth


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

/*------------------------------------------------ AWS SETTINGS --------------------------------------------*/
AWS.config.update({
  region: config.awsRegion,
  accessKeyId: env_awsaccesskey,
  secretAccessKey: env_awsprivatekey
});

var s3 = new AWS.S3();

/*------------------------------------------------ RETHINK CONNECTION --------------------------------------*/
let rethinkConnection = null  
let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null
rethinkDBObj.connect({ 
    host:rhost, 
    port:rport, 
    db:rdb,
    authKey: rauth,
    ssl: ssl
  }, function(err, conn) {
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

/*------------------------------------------------ GET DATA FROM S3 ----------------------------------------*/
async function getDataFromS3(params) {
  return new Promise((resolve, reject) => {
    s3.getObject(params, function(err, data) {
      if (err) throw err;
      zlib.unzip(data.Body, function(err, buf) {
        return resolve(buf.toString("utf8"))
      })
    })
  })
}

/*------------------------------------------------ GET DATA FROM S3 ----------------------------------------*/
async function parseEmail(email) {
  return new Promise((resolve, reject) => {
    const simpleParser = require('mailparser').simpleParser;
    simpleParser(email, (err, mail) => {
      resolve(mail);
    })
  })
}

/*------------------------------------------------ READ EMAIL-ID -------------------------------------------*/
async function readEmailId(mid,sid) {
  await rethinkDBObj.table('emails')
  .filter(rethinkDBObj.row('headers')('references').contains(mid)
  .or(rethinkDBObj.row('headers')('messageId').eq(mid)))
  .filter(
    rethinkDBObj.row('rcpTo').contains(sid)
    .or(rethinkDBObj.row('data')('from').eq(sid))
    .and(rethinkDBObj.row('received').eq(true))
    .and(rethinkDBObj.row('read').eq(false))  
  )
  .update({'read' : true})
  .run(rethinkConnection)

  await rethinkDBObj.table('emails')
  .filter(
    rethinkDBObj.row('rcpTo').contains(sid)
    .or(rethinkDBObj.row('data')('from').eq(sid))
    .and(rethinkDBObj.row('received').eq(true))
    .and(rethinkDBObj.row('read').eq(false))  
  )
  .count()
  .run(rethinkConnection, function(err, cursor) {
    rethinkDBObj.table('emailIds')
    .filter({'emailid' : sid})
    .update({'unreadCount' : cursor})
    .run(rethinkConnection)
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

/*------------------------------------------------ SEND EMAIL ---------------------------------------------*/
async function sendEmailFun(req){
  req = await json(req)
  let inReplyTo = ''
  let references = []
  if(req.to!='' && req.to!=undefined){
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


    if(!Array.isArray(req.to)){
      req.to = req.to.split(',')
    }
    if(!Array.isArray(req.cc)){
      req.cc = req.cc.split(',')
    }
    if(!Array.isArray(req.bcc)){
      req.bcc = req.bcc.split(',')
    }
    

    //---------------------- set inReplyTo and references of parent email
    if (req.parentId != '' && req.parentId != undefined) {
      //----------------------  save email-ids
      saveEmailIds(req.from)
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
    if (req.parentId == '' || req.parentId == undefined) {
      saveSubjects({'from':req.from,'messageId':emailSendResponse.response.messageId,'subject':req.subject})
    }
    //----------------------  save calendar events
    if(req.icalStartDate!='' && req.icalStartDate!=undefined && req.icalStartDate!='Invalid date'
      && req.icalStartTime!='' && req.icalStartTime!=undefined && req.icalStartTime!='Invalid time'){
      saveCalendarEvents(req)
      req.calEvent = true
    }
    //----------------------  insert email data
    let rcpTo = req.to.concat(req.cc).concat(req.bcc)
    if(!Array.isArray(rcpTo)){
      rcpTo = new Array(rcpTo)
    }
    console.log(req)
    let replyPosition = req.body.indexOf("----- Original Message -----")
    let finalBody = req.body.substring(0, replyPosition)

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
        'body' : finalBody
      },
      'headers' : {
        'messageId' : emailSendResponse.response.messageId,
        'inReplyTo' : inReplyTo,
        'references' : references
      },
      'rcpTo' : rcpTo
    })
    .run(rethinkConnection)

    return {'success':'email sent successfully'}
  }
  else{
    return {'error':'Atleast one recipient is required.'}
  }
}

/*---------------------------------------------- EMAIL GROUP SERVICE ---------------------------------------*/
const emailGroups = cors(jwtAuth(privateKey)(async(req, res) => {
  await rethinkDBObj.db(rdb).table('emailIds')
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
  let resp = await sendEmailFun(req);
  send(res, 200, resp)
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
  // let file = path.join(__dirname, './public/index.html');

  // fs.exists(file, exist => {
  //   if (!exist) {
  //     send(res, 404)
  //     return
  //   }

  //   if (fs.statSync(file).isDirectory()) {
  //     file += path.join(__dirname, './public/index.html');
  //   }

  //   fs.readFile(file, (err, data) => {
  //     if (err) {
  //       send(res, 500)
  //     } else {
  //       res.setHeader('Content-type', mime.getType(file))
  //       send(res, 200, data)
  //     }
  //   })
  // })
})

/*---------------------------------------------- EMAIL-DETAIL SERVICE -------------------------------------*/
const emailDetail = cors(jwtAuth(privateKey)(async(req, res) => {
  let params = {
    Bucket: 'airflowbucket1',
    Key: 'pass/'+req.query.s3Key
  }  
  let data = await getDataFromS3(params)
  data = await parseEmail(data)
  send(res, 200, data)
}))

/*---------------------------------------------- SAVE MJML SERVICE ----------------------------------------*/
const saveMjml = cors(jwtAuth(privateKey)(async(req, res) => {
  req = await json(req)
  await rethinkDBObj.table('mjmlTemplates')
  .insert({
    'name' : req.name,
    'theme' : req.theme
  })
  .run(rethinkConnection)
  send(res, 200, {'success':'theme saved successfully'})
}))

/*---------------------------------------------- MJML LIST SERVICE ---------------------------------------*/
const mjmlList = cors(jwtAuth(privateKey)(async(req, res) => {
  await rethinkDBObj.table('mjmlTemplates')
  .run(rethinkConnection, function(err, cursor) {
    if (err) throw err
    cursor.toArray(function(err, response) {
      if (err) throw err
      send(res,200,response)
    })
  })
}))

/*---------------------------------------------- SELECTED MJML SERVICE -----------------------------------*/
const getTheme = cors(jwtAuth(privateKey)(async(req, res) => {
  await rethinkDBObj.table('mjmlTemplates')
  .filter({'id' : req.params.id})
  .run(rethinkConnection, function(err, cursor) {
    if (err) throw err
    cursor.toArray(function(err, response) {
      if (err) throw err
      send(res,200,response)
    })
  })
}))


/*---------------------------------------------- SEND PASSWORD SERVICE ---------------------------------------*/
const sendPassword = cors((async(req, res) => {
  let resp = await sendEmailFun(req);
  send(res, 200, resp)
}))


/*---------------------------------------------- NOT FOUND SERVICE ----------------------------------------*/
const notfound = cors(jwtAuth(privateKey)((req, res) => send(res, 200,"")))

/*---------------------------------------------- ROUTES ---------------------------------------------------*/
module.exports = router(
  get('/emailGroups', emailGroups),
  get('/emailSubjects', emailSubjects),
  get('/emailConversation', emailConversation),
  get('/emailDetail', emailDetail),
  post('/sendEmail', sendEmail),
  post('/sendPassword', sendPassword),
  get('/requestIcalEvents', requestIcalEvents),
  post('/saveMjml', saveMjml),
  get('/mjmlList', mjmlList),
  get('/getTheme/:id', getTheme),
  get('/docs', docs),
  options('/*', notfound)
)
