curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
  "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_seneca_flowz:master","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["4000:4000/tcp"],"version": "4af80929-b28f-45cc-b175-8a99e0e68264 ","environment": {"smtphost": "smtp.gmail.com","smtpPort": "465","user": "obsoftcare@gmail.com","password": "Welcome123@"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 4000,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s274?action=upgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{"inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_email_services_flowz:master","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3003:3003/tcp"],"version": "0d2790b4-9eed-459c-aefe-bf520bdf8e94","environment": {"rdb": "virtualEMail","rhost": "'"$RDB_HOST"'","rport": "'"$RDB_PORT"'","rauth":"'"$RAUTH"'","cert":"'"$CERT"'","senecaurl": "http://api.flowz.com/sendmail","privatekey": "abcdefgabcdefg","awsaccesskey":"'"$AWSACCESSKEY"'","awsprivatekey":"'"$AWSPRIVATEKEY"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3003,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s288?action=upgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
  "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_backend_flowz:master","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3036:3036/tcp","4036:4036/tcp"],"version": "2ec02051-52c4-4518-890c-7af5712dd2e5","environment": {"rdb": "virtualEMail","rhost": "'"$RDB_HOST"'","rport": "'"$RDB_PORT"'","rauth":"'"$RAUTH"'","cert":"'"$CERT"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3036,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s281?action=upgrade'


# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# -H 'Accept: application/json' \
# -H 'Content-Type: application/json' \
# -d '{
#      "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/mail_frontend_flowz:master","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=vmail-front"},"ports": ["80:80/tcp","443:443/tcp"],"version": "f722e75d-59db-409e-8802-dcc517c3137b","healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 80,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"requestLine": "GET \"http://localhost\" \"HTTP/1.0\"","responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s295?action=upgrade'
