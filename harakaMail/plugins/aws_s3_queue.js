// aws_s3_queue
// documentation via: haraka -c /var/www/html/node/haraka_test -h plugins/aws_s3_queue
// Put your plugin code here
// type: `haraka -h Plugins` for documentation on how to create a plugin
let rethink = require('rethinkdb');
let elasticsearch = require('elasticsearch')
let PythonShell = require('python-shell')

let AWS = require('aws-sdk'),
    zlib = require('zlib'),
    util = require('util'),
    async = require('async'),
    stream = require('stream'),
    Transform = require('stream').Transform
const fs = require('fs')

let enviroment = 'prod'
if (process.env['NODE_ENV'] == 'dev') {
    enviroment = 'dev'
}

let mainObject
exports.register = async function() {
  mainObject = this
  let config = this.config.get('config_' + enviroment + '.json')
  // this.logdebug("Config loaded : " + util.inspect(config))

  if (process.env['AWS_AKEY'] != '') {
      config.aws.accessKeyId = process.env['AWS_AKEY']
  }
  if (process.env['AWS_SKEY'] != '') {
      config.aws.secretAccessKey = process.env['AWS_SKEY']
  }

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

  if (this.rethinkDBConfig.enable) {
    // this.logdebug('RethinkDB Config loaded : ' + util.inspect(this.rethinkDBConfig))
    try {
      this.rethinkDBConnection = await connectRethinkDB(this.rethinkDBConfig, this)
    } catch (err) {
      throw err
    }
  }

  this.esConfig = config.elasticsearch
  if (this.esConfig.enable) {
    // this.logdebug('ElasticSearch Config loaded : ' + util.inspect(this.esConfig))
    try {
      this.esClient = await connectElasticSearch(this.esConfig, this)
    } catch (err) {
      throw err
    }
  }
  this.vmail = config.vmail
  this.S3Obj = new AWS.S3()
}

async function parseEmail(email) {
  return new Promise((resolve, reject) => {
    const simpleParser = require('mailparser').simpleParser;
    simpleParser(email, (err, mail) => {
      resolve(mail);
    })
  })
}

let parseBody = function(buf, plugin, type) {
  return new Promise((resolve, reject) => {
    let newBuff = ''
    let options = {
        mode: 'text',
        args: [type, buf],
        scriptPath: '/var/www/node/harakamail/plugins/',
        pythonPath: '/usr/bin/python3',
    }
    PythonShell.run('mailhtml.py', options, function(err, results) { //TODO: create a python web-service for this
      if (err) {
        reject('fail')
      } else {
        resolve(results[0])
      }
    })
  })
}

const MailComposer = require('nodemailer/lib/mail-composer');

let createMessgeObject = function(mailObj) {
  mailObj.from = mailObj.from.text
  mailObj.to = mailObj.to.text
  let mailStream
  var mail = new MailComposer(mailObj);
  var wStream = new TransformStream();
  var streamobj = mail.compile().createReadStream();
  mailStream = streamobj.pipe(wStream)
  return mailStream
}

async function filterReplyMails(plugin, message) {
  // plugin.logerror("transaction data String : " + util.inspect(message))

  let strMSG = null
  if (message.html) {
    strMSG = message.html
  } else {
    strMSG = message.textAsHtml
  }
  message.textAsHtml = await parseBody(strMSG, plugin, 'html')
  message.html = message.textAsHtml
  message.text = await parseBody(message.text, plugin, 'plain')
  return message
}

let onlyReplyMessage = ''

exports.hook_queue = async function(next, connection) {
    let plugin = this

    let transaction = connection.transaction
    let orignalMessageStream = transaction.message_stream
    let emailTo = transaction.rcpt_to
    let attachedIdx = JSON.stringify(transaction.header.headers).indexOf("multipart/mixed")

    transaction.message_stream = await parseEmail(transaction.message_stream)

    if (plugin.vmail.removeThreadedDuplicateBodyContent) {
      transaction.message_stream = await filterReplyMails(plugin, transaction.message_stream)
    }
    onlyReplyMessage = {
      html: transaction.message_stream.html,
      text: transaction.message_stream.text,
      textAsHtml: transaction.message_stream.textAsHtml
    }

    transaction.message_stream = await createMessgeObject(transaction.message_stream)

    connection.relaying = true
    let gzip = zlib.createGzip()
    let transformer = plugin.zipBeforeUpload ? gzip : new TransformStream()
    let body = transaction.message_stream.pipe(transformer)
    let gzipNew = zlib.createGzip()
    let transformerNew = plugin.zipBeforeUpload ? gzipNew : new TransformStream()
    let orignalBody = orignalMessageStream.pipe(transformerNew)
    transaction.message_stream = orignalMessageStream

    let s3Orignal = plugin.S3Obj
    let s3 = plugin.S3Obj
    let addresses = plugin.copyAllAddresses ? transaction.rcpt_to : transaction.rcpt_to[0]

    let s3key = 'vmail/' + transaction.uuid + plugin.fileExtension

    let params = {
      Bucket: plugin.s3Bucket,
      Key: s3key,
      Body: body
    }

    s3.upload(params).on('httpUploadProgress', function(evt) {
      // plugin.logdebug('Uploading file... Status : ' + util.inspect(evt))
    }).send(function(err, data) {
      // plugin.logdebug('S1113 Send response data : ' + util.inspect(err))
      // plugin.logdebug('S3 Send response data : ' + util.inspect(data))
      emailsSaveToDB (addresses, transaction, plugin, attachedIdx, s3key)
      .then(result =>{ next(OK, 'Email Accepted.')})
      .catch(err =>{ plugin.logerror(err); next()})
    })

    // plugin.logerror('All Email Ids : ' + util.inspect(addresses))

  //   async.each(addresses, function (address, eachCallback) {
  //     let key = address.user + address.host + '/' + transaction.uuid + plugin.fileExtension
  //     let params = {
  //       Bucket: plugin.s3Bucket,
  //       Key: key,
  //       Body: body
  //     }
  //     s3.upload(params).on('httpUploadProgress', function(evt) {
  //       plugin.logdebug('Uploading file... Status : ' + util.inspect(evt))
  //     }).send(function(err, data) {
  //       plugin.logdebug('S1113 Send response data : ' + util.inspect(err))
  //       plugin.logdebug('S3 Send response data : ' + util.inspect(data))
  //       eachCallback(err)
  //     })
  // }, function (err) {
  //     if (err) {
  //     } else {
  //     }
  //   })
}

exports.shutdown = function() {
  this.loginfo("Shutting down queue plugin.");
}

async function emailsSaveToDB (addresses, transaction, plugin, attachedIdx, s3Key) {
  return new Promise((resolve, reject) => {
    try {
      for (var i = 0; i < addresses.length; i++) {
        plugin.logerror('=============Error ========= : ' + util.inspect(addresses[i]))
        let emailTos = addresses[i].original.match(/\<([^)]+)\>/)[1]
        saveEmailId(plugin, emailTos)
        saveSubjects(transaction, plugin, emailTos)
      }
      // save data in rethinkDB if enable
      if (plugin.rethinkDBConfig.enable) {
        saveEmailToRethinkDB(transaction, plugin, attachedIdx, s3Key,addresses)
      }
      // save data in elastic if enable
      if (plugin.esConfig.enable) {
        saveEmailToElasticSearch(transaction, plugin, attachedIdx)
      }

      resolve('Email Data Inserted')
    } catch (err) {
      reject(err)
    }
  })
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

function connectElasticSearch(cxnOptions, pluginObj) {
  return new Promise((resolve, reject) => {
    let ESClient = new elasticsearch.Client({
      host: cxnOptions.esUrl,
      log: cxnOptions.log
    })
    resolve(ESClient)
  })
}

function connectRethinkDB(cxnOptions, pluginObj) {
  return new Promise((resolve, reject) => {
    rethink.connect({
      host: cxnOptions.host,
      port: cxnOptions.port,
      db: cxnOptions.db
    }, function(err, conn) {
      if (err) {
        pluginObj.logerror(err)
        throw err
      } else {
        // pluginObj.logdebug('RethinkDB connected')
        resolve(conn)
      }
    })
  })
}

function saveEmailId(pluginObj, emailIdObj) {
  let emailObj = {
    'emailid': emailIdObj.replace('/\s/g','').replace('/\n/g',''),
    'created' : rethink.ISO8601(new Date().toISOString()),
    'unreadCount' : 1,
    'totalCount' : 1,
  }
  rethink.db(pluginObj.rethinkDBConfig.db)
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
          .update(updateObj)
          .run(pluginObj.rethinkDBConnection)
      }
    })
  })
}

function saveSubjects (subObj, pluginObj, emailTos) {
  if(subObj.header.headers.references !== undefined) {
    // for(let i=0 ; i<emailTos.length ; i++) {
      rethink.db(pluginObj.rethinkDBConfig.db)
      .table(pluginObj.rethinkDBConfig.tblEmailSubjects)
      .filter(rethink.row("emailId").eq(emailTos)
      .and(rethink.row("messageId").eq(subObj.header.headers.references[0].replace('\n', ''))))
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
    // }
  } else {
    // for(let i=0 ; i<emailTos.length ; i++){
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
    // }
  }
}

function saveEmailToRethinkDB(emailTrans, pluginObj, attachedIdx, s3Key, addresses) {
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
        body : onlyReplyMessage
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
    // pluginObj.logerror("=============messageData===============")
    // pluginObj.logerror(messageData)
    rethink.db(pluginObj.rethinkDBConfig.db).table(pluginObj.rethinkDBConfig.table).insert(messageData).run(pluginObj.rethinkDBConnection, function(err, result) {
      if (err) {
        // pluginObj.logerror(err)
        throw err
      } else {
        // pluginObj.logdebug('inserted successfully', result)
        // pluginObj.logdebug('inserted successfully')
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
