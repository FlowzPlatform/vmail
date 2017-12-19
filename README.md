# **Flowz-Mail**
---
#### vmailClient, vmailServer, vmailServices, vmailSeneca and haraka mail server.

## Getting started

Take clone of project and execute following commands

```bash
$ cd Flowz-Mail/vmailClient
$ npm install
$ cd Flowz-Mail/vmailServer
$ npm install
$ cd Flowz-Mail/vmailServices
$ npm install
$ cd Flowz-Mail/vmailSeneca
$ npm install
```

 
 # **VmailSeneca**
---

*  **About**
     
       It is email sending service.
    
	```json
	It requires smtp settings.
	```
    
    ```json
	You can pass credential using environment variable.
    
    -----------------
    For example
    -----------------
    smtphost="smtp.gmail.com" smtpPort="465" user="username" password="password" npm start
   
	```
    
    
# **VmailService**
---

*  **About**
     
       It is Back and logic and micro-services.
    
	```json
	It requires rethinkdb configuration and aws connection.It depends on vmailSeneca also.
	```
    
    ```json
	You can pass credential using environment variable.
    
    -----------------
    For example
    -----------------
    awsaccesskey="XXXXXXXXXXXXXXX" awsprivatekey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" rhost="localhost" rport="28015" rdb="virtualEMail"  rauth="authkey" cert="/full path" senecaurl="http://localhost:4000" privatekey="jwt private key" npm start
    
    or
    
    awsaccesskey="XXXXXXXXXXXXXXX" awsprivatekey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" rhost="localhost" rport="28015" rdb="virtualEMail" senecaurl="http://localhost:4000" privatekey="jwt private key" npm start
   
	```
    
# **VmailServer**
---

*  **About**
     
       It is socket io service using feathersJS.
    
	```json
	It requires rethinkdb configuration.
	```
    
    ```json
	You can pass credential using environment variable.
    
    -----------------
    For example
    -----------------
    rhost="localhost" rport="28015"  rdb="virtualEMail" npm start
    
    or
    
    rhost="localhost" rport="28015"  rdb="virtualEMail" rauth="authKey" cert="/certificate path" npm start
   
	```

# **VmailClient**
---

*  **About**
     
       It is front-end logic developed with vueJS.
    
	```json
	It has dependencies on vmailServices and vmailServer.So make sure that vmailServer and vmailServices are running.
	```
    
    ```json
	You can give dependency url using environment variables.
    
    -----------------
    For example
    -----------------
    microUrl="http://localhost:3003" socketUrl="http://localhost:3036" callbackUrl="http://localhost:8080" npm start
    
   
	```

   * **note:** We have used our login services.




    


  
