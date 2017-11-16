'use strict'
const { mjml2html } =  require('mjml')
const Seneca = require('seneca')
const Express = require('express')
const Web = require('seneca-web')
const nodemailer = require('nodemailer')
const cors = require('cors')
var icalToolkit = require('ical-toolkit')
var builder = icalToolkit.createIcsFileBuilder()
var seneca = Seneca()
let expObj = Express()
expObj.use(cors())
let smtpSettings = require('config')

var Routes = [{
  prefix: '/email',
  pin: 'role:email,cmd:send',
  map: {send: {GET: false,POST: true}}
}]

var config = {
  routes: Routes,
  adapter: require('seneca-web-adapter-express'),
  context: expObj,
  options: {parseBody: true}
}

seneca.client()
.use(Web, config)
.ready(() => {
  var server = seneca.export('web/context')()
  server.listen('4000', () => {
    console.log('server started on: 4000')
  })
})

seneca.add({
  role: 'email',
  cmd: 'send'
}, async function(args, done) {
  let reqBody = JSON.parse(args.args.body)
  if(reqBody.to!="" && reqBody.to!=undefined){
    let emailResponse
    try {
      emailResponse = await sendEmail(reqBody)
      done(null, {
        response: emailResponse
      })
    } 
    catch (e) {
      done(e, null)
    }
  }
  else{
    done(null)
  }
})

async function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    mailOptions.to = mailOptions.to
    mailOptions.cc = (mailOptions.cc) ? mailOptions.cc : []
    mailOptions.bcc = (mailOptions.bcc) ? mailOptions.bcc : []
    mailOptions.html = (mailOptions.body) ? mailOptions.body : ''


    let auth = {
      user: smtpSettings.auth.user,
      pass: smtpSettings.auth.pass
    }
    if(mailOptions.icalStartDate!='' && mailOptions.icalStartDate!=undefined && mailOptions.icalStartDate!='Invalid date'
      && mailOptions.icalStartTime!='' && mailOptions.icalStartTime!=undefined && mailOptions.icalStartTime!='Invalid time'){
      let startDate = mailOptions.icalStartDate+','+mailOptions.icalStartTime
      let icalFromName = mailOptions.from.replace('@','.')
      icalFromName = icalFromName.substring(0, icalFromName.indexOf("."))
      let icalTos = mailOptions.to
      let icalTosEmail = []
      for(let i=0; i<icalTos.length ; i++){
        let icalToName = icalTos[i].replace('@','.')
        icalToName = icalToName.substring(0, icalToName.indexOf("."))
        icalTosEmail.push({
          name: icalToName,
          email: icalTos[i],
          rsvp: true
        })
      }

      builder.calname = 'Vmail Calender'
      builder.method = 'REQUEST'
      builder.events.push({
        start: new Date(startDate),
        end: new Date(startDate),
        stamp: new Date(),
        summary: mailOptions.icalSummary,
        organizer: {
          name: icalFromName,
          email: mailOptions.from
        },
        attendees: icalTosEmail
      });
      var icsFileContent = builder.toString();

    
      mailOptions.icalEvent = {
        filename: 'invitation.ics',
        method: 'request',
        content : icsFileContent
      }
    }
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: smtpSettings.connection.host,
      port: smtpSettings.connection.port,
      secure: smtpSettings.connection.secure,
      auth: auth
    })

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error)
      } else {
        return resolve(info)
      }
    })
  })
}