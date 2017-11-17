let rethink = require('rethinkdb');
let elasticsearch = require('elasticsearch')
let PythonShell = require('python-shell')
const fs = require('fs')
const MailComposer = require('nodemailer/lib/mail-composer')
let AWS = require('aws-sdk'),
    zlib = require('zlib'),
    util = require('util'),
    async = require('async'),
    stream = require('stream'),
    Transform = require('stream').Transform

let enviroment = 'prod'
if (process.env['NODE_ENV'] == 'dev')
  enviroment = 'dev'

exports.register = async function() {
  let config = this.config.get('config_' + enviroment + '.json')
  if (process.env['AWS_AKEY'] != '')
    config.aws.accessKeyId = process.env['AWS_AKEY']
  if (process.env['AWS_SKEY'] != '')
    config.aws.secretAccessKey = process.env['AWS_SKEY']

  AWS.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region
  })

  this.s3Bucket = config.aws.s3Bucket
  this.zipBeforeUpload = config.aws.zipBeforeUpload
  this.fileExtension = config.aws.fileExtension
  this.copyAllAddresses = config.aws.copyAllAddresses
  this.rethinkDBConfig = config.rethinkDb
  this.esConfig = config.elasticsearch

  if (this.rethinkDBConfig.enable) {
    try {
      this.rethinkDBConnection = await connectRethinkDB(this.rethinkDBConfig, this)
    }
    catch (err){
      throw err
    }
  }

  if (this.esConfig.enable) {
    try {
      this.esClient = await connectElasticSearch(this.esConfig, this)
    }
    catch (err) {
      throw err
    }
  }
  this.vmail = config.vmail
  this.S3Obj = new AWS.S3()
}


exports.hook_queue = async function (next, connection) {
  let plugin = this
  let transaction = connection.transaction
  let orignalMessageStream = transaction.message_stream
  // let emailTo = transaction.rcpt_to
  let attachedIdx = JSON.stringify(transaction.header.headers).indexOf('multipart/mixed')

  let parseMailObject = await parseEmail(plugin, transaction.message_stream)
                                    .catch((err) => {
                                      plugin.logerror('======Parse mail cache 1=====')
                                      plugin.logerror(err)
                                    })
  // plugin.logerror("========================display Parse mail start==========================")
  // plugin.logerror(transaction.message_stream)
  // plugin.logerror("========================display Parse mail end==========================")

  let onlyReplyMessage = {
    html: '',
    textAsHtml: '',
    text: ''
  }
  if (plugin.vmail.removeThreadedDuplicateBodyContent) {
    parseMailObject = await filterReplyMails(plugin, parseMailObject)
                                        .catch((err) => {
                                          plugin.logerror('======filter Reply Mails=====')
                                          plugin.logerror(err)
                                        })
    onlyReplyMessage = {
      html: (parseMailObject.html) ? parseMailObject.html : '',
      textAsHtml: (transaction.message_stream.textAsHtml) ? parseMailObject.textAsHtml : '',
      text: (parseMailObject.text) ? parseMailObject.text : ''
    }
  } else {
    onlyReplyMessage = {
      html: (parseMailObject.html) ? parseMailObject.html : '',
      textAsHtml: (transaction.message_stream.textAsHtml) ? parseMailObject.textAsHtml : '',
      text: (parseMailObject.text) ? parseMailObject.text : ''
    }
  }

  transaction.onlyReplyMessage = onlyReplyMessage
  //
  // transaction.message_stream = await createMessgeObject(plugin, transaction.message_stream)
  //                                   .catch((err) => {
  //                                     plugin.logerror('======create Messge Object=====')
  //                                     plugin.logerror(err)
  //                                   })

  connection.relaying = true
  let gzip = zlib.createGzip()
  let transformer = plugin.zipBeforeUpload ? gzip : new TransformStream()
  let body = transaction.message_stream.pipe(transformer)
  // let gzipNew = zlib.createGzip()
  // let transformerNew = plugin.zipBeforeUpload ? gzipNew : new TransformStream()
  // let orignalBody = orignalMessageStream.pipe(transformerNew)
  // transaction.message_stream = orignalMessageStream

  let s3 = plugin.S3Obj
  let addresses = plugin.copyAllAddresses ? transaction.rcpt_to : transaction.rcpt_to[0]
  let s3key = 'vmail/' + transaction.uuid + plugin.fileExtension

  let params = {
    Bucket: plugin.s3Bucket,
    Key: s3key,
    Body: body
  }

  s3.upload(params).on('httpUploadProgress', function(evt) {}).send(function(err, data) {
    emailsSaveToDB (addresses, transaction, plugin, attachedIdx, s3key)
    .then(result =>{ next(OK, 'Email Accepted.')})
    .catch(err =>{ plugin.logerror('======S3 upload====='); plugin.logerror(util.inspect(err)); next()})
  })
}

exports.shutdown = function() {
  this.loginfo("Shutting down queue plugin.")
}

async function parseEmail (plugin, email) {
  return new Promise((resolve, reject) => {
    try{
      const simpleParser = require('mailparser').simpleParser;
      simpleParser(email, (err, mail) => {
        // plugin.logerror('=================================parseEmail==============================')
        // plugin.logerror(mail)
        resolve(mail)
      })
    }
    catch(err) {
      plugin.logerror(err)
      reject(err)
    }
  })
}

async function parseBody (buf, plugin, type) {
  return new Promise((resolve, reject) => {
    plugin.logerror("====================================path==========="+__dirname)
    try{
      let newBuff = ''
      let options = {
          mode: 'text',
          args: [type, buf],
          scriptPath:  '/var/www/node/harakamail/plugins/',
          pythonPath: plugin.pythonPath
      }
      PythonShell.run('mailhtml.py', options, function(err, results) {
        if (err) {
          reject('fail')
        } else {
          // plugin.logerror(results[0])
          resolve(results[0])
        }
      })
    }
    catch(err) {
      reject(err)
    }
  })
}

async function filterReplyMails (plugin, message) {
  return new Promise(async(resolve, reject) => {
    try {
      let strMSG = null
      if (message.html) {
        message.html = await parseBody(message.html, plugin, 'html')
                                    .catch((err) => {
                                      plugin.logerror(err)
                                    })
      }
      if (message.textAsHtml) {
        message.textAsHtml = await parseBody(message.textAsHtml, plugin, 'html')
                                    .catch((err) => {
                                      plugin.logerror(err)
                                    })
      }
      // plugin.logerror('=================================text html==============================')
      // plugin.logerror(message.html)
      if (message.text) {
        message.text = await parseBody(message.text, plugin, 'plain')
                              .catch((err) => {
                                plugin.logerror(err)
                              })
        // plugin.logerror('=================================filter==============================')
        // plugin.logerror(message)
      }
      resolve(message)
    } catch (err) {
      reject(err)
    }
  })
}

async function createMessgeObject (plugin, mailObj) {
    return new Promise((resolve, reject) => {
    try {
      // plugin.logerror('=================================create msg obj==============================')
      // plugin.logerror(mailObj)
      mailObj.from = mailObj.from.text
      mailObj.to = mailObj.to.text
      let mailStream
      var mail = new MailComposer(mailObj);
      var wStream = new TransformStream();
      var streamobj = mail.compile().createReadStream();
      mailStream = streamobj.pipe(wStream)
      // plugin.logerror('=================================create msg obj==============================')
      // plugin.logerror(mailStream)
      resolve(mailStream)
    }
    catch(err){
      reject(err)
    }
  })
}

async function emailsSaveToDB (addresses, transaction, plugin, attachedIdx, s3Key) {
  return new Promise((resolve, reject) => {
    try {
      for (var i = 0; i < addresses.length; i++) {
        let emailTos = addresses[i].original.match(/\<([^)]+)\>/)[1]
        plugin.logerror('======save EmailId=====')
        saveEmailId(plugin, emailTos)
        plugin.logerror('======save Subjects=====')
        saveSubjects(transaction, plugin, emailTos)
      }
      // save data in rethinkDB if enable
      if (plugin.rethinkDBConfig.enable) {
        plugin.logerror('======save Email To RethinkDB=====')
        saveEmailToRethinkDB (transaction, plugin, attachedIdx, s3Key,addresses)
      }
      // save data in elastic if enable
      if (plugin.esConfig.enable) {
        saveEmailToElasticSearch(transaction, plugin, attachedIdx)
      }
      resolve('Email Data Inserted')
    }
    catch (err) {
      plugin.logerror('======emails Save To DB=====')
      plugin.logerror(err)
      reject(err)
    }
  })
}

async function connectElasticSearch(cxnOptions, pluginObj) {
  return new Promise((resolve, reject) => {
    let ESClient = new elasticsearch.Client({
      host: cxnOptions.esUrl,
      log: cxnOptions.log
    })
    resolve(ESClient)
  })
}

async function connectRethinkDB(cxnOptions, pluginObj) {
  return new Promise((resolve, reject) => {
    rethink.connect({
      host: cxnOptions.host,
      port: cxnOptions.port,
      db: cxnOptions.db
    }, function(err, conn) {
      if (err) {
        throw err
      } else {
        resolve(conn)
      }
    })
  })
}

async function saveEmailId(pluginObj, emailIdObj) {
  let emailObj = {
    'emailid': emailIdObj.replace('/\s/g','').replace('/\n/g',''),
    'created' : rethink.ISO8601(new Date().toISOString()),
    'unreadCount' : 1,
    'totalCount' : 1,
  }
  await rethink.db(pluginObj.rethinkDBConfig.db)
  .table(pluginObj.rethinkDBConfig.tblEmailIds)
  .filter({'emailid': emailObj.emailid})
  .run(pluginObj.rethinkDBConnection, function(err, cursor) {
    cursor.toArray(function(err, result) {
      if(result.length<1){
        rethink.db(pluginObj.rethinkDBConfig.db)
          .table(pluginObj.rethinkDBConfig.tblEmailIds)
          .insert(emailObj)
          .run(pluginObj.rethinkDBConnection)
      }
      else{
        let updateObj = {'unreadCount' : result[0].unreadCount+1 , 'totalCount' : result[0].totalCount+1 }
        rethink.db(pluginObj.rethinkDBConfig.db)
          .table(pluginObj.rethinkDBConfig.tblEmailIds)
          .filter({'id':result[0].id})
          .update(updateObj)
          .run(pluginObj.rethinkDBConnection)
      }
    })
  })
}

function saveSubjects (subObj, pluginObj, emailTos) {
  //
  // pluginObj.logerror('=======================saveSubjects=====================')
  // pluginObj.logerror(subObj.header.headers.references)
  // pluginObj.logerror('=======================references====================='+emailTos)
  // pluginObj.logerror(subObj.header.headers.references[0].replace('\n', ''))

  if(subObj.header.headers.references && subObj.header.headers.references !== undefined) {

      let refArr = subObj.header.headers.references[0].replace('\n', '').split(' ')
      let mainMessageId = refArr[0]
      rethink.db(pluginObj.rethinkDBConfig.db)
      .table(pluginObj.rethinkDBConfig.tblEmailSubjects)
      .filter(rethink.row("emailId").eq(emailTos)
      .and(rethink.row("messageId").eq(mainMessageId)))
      .run(pluginObj.rethinkDBConnection, function(err, cursor) {
        cursor.toArray(function (err, result) {
          if(result.length < 1) {
            let subject = {
              'emailId' : emailTos,
              'messageId' : subObj.header.headers['message-id'][0].replace(/\n/g, ''),
              'subject' : String(subObj.header.headers.subject).replace("[ '", '').replace("' ]", '').trim(),
              'created' : rethink.ISO8601(new Date().toISOString()),
              'unread' : true
            }
            rethink.db(pluginObj.rethinkDBConfig.db)
            .table(pluginObj.rethinkDBConfig.tblEmailSubjects)
            .insert(subject).run(pluginObj.rethinkDBConnection)
          }
          else{
            rethink.db(pluginObj.rethinkDBConfig.db)
            .table(pluginObj.rethinkDBConfig.tblEmailSubjects)
            .update({'unread':true}).run(pluginObj.rethinkDBConnection)
          }
        })
      })
  } else {
    let subject = {
      'emailId' : emailTos,
      'messageId' : subObj.header.headers['message-id'][0].replace(/\n/g, ''),
      'subject' : String(subObj.header.headers.subject).replace("[ '", '').replace("' ]", '').trim(),
      'created' : rethink.ISO8601(new Date().toISOString()),
      'unread' : true,
    }
    rethink.db(pluginObj.rethinkDBConfig.db)
    .table(pluginObj.rethinkDBConfig.tblEmailSubjects)
    .insert(subject).run(pluginObj.rethinkDBConnection)
  }
}

function saveEmailToRethinkDB(emailTrans, pluginObj, attachedIdx, s3Key, addresses) {
  try {
    let mailRef
    let references = []
    if (emailTrans.header.headers.references) {
      mailRef = emailTrans.header.headers.references[0]
      mailRef = mailRef.split(' ')
    }
    let mailRefId
    if (mailRef && Array.isArray(mailRef) && mailRef.length >= 2) {
      mailRefId = mailRef[0]
    }

    if (Array.isArray(mailRef) && mailRef.length >= 2) {
      mailRefId = mailRef[0]
    }

    if (emailTrans.header.headers.references != undefined) {
      emailTrans.header.headers.references[0] = emailTrans.header.headers.references[0].replace(/\n/g, '')
      emailTrans.header.headers.references = emailTrans.header.headers.references[0].split(' ')
      references = emailTrans.header.headers.references
    }

    if (emailTrans.header.headers['message-id'] != undefined) {
      emailTrans.header.headers['message-id'][0] = emailTrans.header.headers['message-id'][0].replace(/\n/g, '')
    }

    let cc = []
    let to = emailTrans.header.headers.to[0].replace(/ /g,'').split(',')
    to = to.map(a => {
      if(a.includes("<") || a.includes(">"))
        return a.match(/\<([^)]+)\>/)[1].replace(/\n/g, '').replace(/\s/g, '')
      else
        return a.replace(/\n/g, '').replace(/\s/g, '')
    })
    if(emailTrans.header.headers.cc != undefined){
      cc = emailTrans.header.headers.cc[0].replace(/ /g,'').split(',')
      cc = cc.map(a => {
        if(a.includes("<") || a.includes(">"))
          return a.match(/\<([^)]+)\>/)[1].replace(/\n/g, '').replace(/\s/g, '')
        else
          return a.replace(/\n/g, '').replace(/\s/g, '')
      })
    }

    let rcpTo = addresses.map(a => a.original.match(/\<([^)]+)\>/)[1])
    if(rcpTo && !Array.isArray(rcpTo)) {
      rcpTo = new Array(rcpTo)
    }
    let messageData = {
      created : rethink.ISO8601(new Date().toISOString()),
      received : true,
      attachment: attachedIdx >= 0 ? true : false,
      read : false,
      data : {
        from : emailTrans.mail_from.original.match(/\<([^)]+)\>/)[1],
        to : to,
        cc : cc,
        subject : String(emailTrans.header.headers.subject).replace("[ '", '').replace("' ]", ''),
        body : emailTrans.onlyReplyMessage
      },
      headers:{
        messageId : emailTrans.header.headers['message-id'][0],
        references : references
      },
      s3Key: s3Key,
      rcpTo: rcpTo
    }
    // if (mailRefId !== undefined) {
    //   messageData['parentId'] = mailRefId.replace('>', '').replace('<', '')
    // }
    rethink.db(pluginObj.rethinkDBConfig.db)
    .table(pluginObj.rethinkDBConfig.table)
    .insert(messageData)
    .run(pluginObj.rethinkDBConnection)
  } catch (err) {
    pluginObj.logerror('======save Email To RethinkDB=====')
    pluginObj.logerror(util.inspect(err))
  }
}

function saveEmailToElasticSearch(emailTrans, pluginObj, attachedIdx) {
  let makeEmailJsonObj = []
  makeEmailJsonObj.push({
    index: {
      _index: pluginObj.esConfig.index,
      _type: pluginObj.esConfig.type,
      _id: emailTrans.uuid // data[index]._id
    }
  })

  let mailRef
  if (emailTrans.header.headers.references) {
    mailRef = emailTrans.header.headers.references[0]
    mailRef = mailRef.split(' ')
  }

  let mailRefId
  if (mailRef && Array.isArray(mailRef) && mailRef.length >= 2) {
    mailRefId = mailRef[0]
  }
  let messageData = {
    from: emailTrans.mail_from,
    to: emailTrans.rcpt_to,
    subject: String(emailTrans.header.headers.subject).replace("[ '", '').replace("' ]", ''),
    created: new Date().toGMTString(),
    attachment: attachedIdx >= 0 ? true : false,
    headers: emailTrans.header.headers
  }
  if (mailRefId !== undefined) {
    messageData['parentId'] = mailRefId.replace('>', '').replace('<', '')
  }
  makeEmailJsonObj.push(messageData)
  dumpToES(makeEmailJsonObj, pluginObj)
}

function dumpToES(makeEmailJsonObj, pluginObj) {
  pluginObj.esClient.bulk({
    body: makeEmailJsonObj
  }, function(err, resp) {
    if (!err) {
      // pluginObj.logdebug('inserted successfully elasticsearch')
    } else {
      // pluginObj.logerror(err)
    }
  })
}

//Dummy transform stream to help with a haraka issue. Can't use message_stream as a S3 API parameter without this.
var TransformStream = function() {
    Transform.call(this);
};
util.inherits(TransformStream, Transform);

TransformStream.prototype._transform = function(chunk, encoding, callback) {
  this.push(chunk);
  callback();
};
