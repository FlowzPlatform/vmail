curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s274?action=finishupgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s288?action=finishupgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s281?action=finishupgrade'

# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s295?action=finishupgrade'
