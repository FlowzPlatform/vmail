curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
  "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_seneca_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["4000:4000/tcp"],"version": "4af80929-b28f-45cc-b175-8a99e0e68264 ","environment": {"smtphost": "smtp.gmail.com","smtpPort": "465","user": "obsoftcare@gmail.com","password": "Welcome123@"}}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s274?action=upgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
  "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_email_services_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3003:3003/tcp"],"version": "0d2790b4-9eed-459c-aefe-bf520bdf8e94","environment": {"rdb": "virtualEMail","rhost": "aws-us-east-1-portal.30.dblayer.com","rport": "16868","rauth":"51b2885598be1c2c1243a5c9c3548ad2","cert":"/cacert","senecaurl": "api.flowz.com/sendmail","privatekey": "abcdefgabcdefg"}}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s288?action=upgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
  "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_backend_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3036:3036/tcp"],"version": "2ec02051-52c4-4518-890c-7af5712dd2e5","environment": {"rdb": "virtualEMail","rhost": "aws-us-east-1-portal.30.dblayer.com","rport": "16868","rauth":"51b2885598be1c2c1243a5c9c3548ad2","cert":"/cacert"}}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s281?action=upgrade'


curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_frontend_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=vmail-front"},"ports": ["80:80/tcp"],"version": "f722e75d-59db-409e-8802-dcc517c3137b"}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s295?action=upgrade'
