# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s274?action=finishupgrade'
#
# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s288?action=finishupgrade'
#
# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s281?action=finishupgrade'
#
# # curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# # -X POST \
# # 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s295?action=finishupgrade'


if [ "$TRAVIS_BRANCH" = "master" ]
then
    {
    echo "call $TRAVIS_BRANCH branch"
    ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=Production" | jq '.data[].id' | tr -d '"'`
    echo $ENV_ID
  }
elif [ "$TRAVIS_BRANCH" = "develop" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
  }
elif [ "$TRAVIS_BRANCH" = "staging" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=Staging" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
  }  
else
  {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=QA" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
  }
fi

SERVICE_ID_SENECA=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services?name=vmail-seneca-service" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_SENECA

SERVICE_ID_MICRO=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services?name=vmail-micro-service" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_MICRO

SERVICE_ID_BACKEND=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services?name=vmail-backend-service" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_BACKEND

SERVICE_ID_FRONTEND=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services?name=vmail-frontend-service" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_FRONTEND

echo "waiting for service to upgrade "
    while true; do

      case `curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
          -X GET \
          -H 'Accept: application/json' \
          -H 'Content-Type: application/json' \
          "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_SENECA/" | jq '.state'` in
          "\"upgraded\"" )
              echo "completing service upgrade"
              curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
                -X POST \
                -H 'Accept: application/json' \
                -H 'Content-Type: application/json' \
                "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_SENECA?action=finishupgrade"
              break ;;
          "\"upgrading\"" )
              echo "still upgrading"
              echo -n "."
              sleep 3
              continue ;;
          *)
              die "unexpected upgrade state" ;;
      esac
    done


    echo "waiting for service to upgrade "
        while true; do

          case `curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
              -X GET \
              -H 'Accept: application/json' \
              -H 'Content-Type: application/json' \
              "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_MICRO/" | jq '.state'` in
              "\"upgraded\"" )
                  echo "completing service upgrade"
                  curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
                    -X POST \
                    -H 'Accept: application/json' \
                    -H 'Content-Type: application/json' \
                    "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_MICRO?action=finishupgrade"
                  break ;;
              "\"upgrading\"" )
                  echo "still upgrading"
                  echo -n "."
                  sleep 3
                  continue ;;
              *)
                  die "unexpected upgrade state" ;;
          esac
        done

        echo "waiting for service to upgrade "
            while true; do

              case `curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
                  -X GET \
                  -H 'Accept: application/json' \
                  -H 'Content-Type: application/json' \
                  "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_BACKEND/" | jq '.state'` in
                  "\"upgraded\"" )
                      echo "completing service upgrade"
                      curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
                        -X POST \
                        -H 'Accept: application/json' \
                        -H 'Content-Type: application/json' \
                        "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_BACKEND?action=finishupgrade"
                      break ;;
                  "\"upgrading\"" )
                      echo "still upgrading"
                      echo -n "."
                      sleep 3
                      continue ;;
                  *)
                      die "unexpected upgrade state" ;;
              esac
            done

            echo "waiting for service to upgrade "
                while true; do

                  case `curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
                      -X GET \
                      -H 'Accept: application/json' \
                      -H 'Content-Type: application/json' \
                      "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_FRONTEND/" | jq '.state'` in
                      "\"upgraded\"" )
                          echo "completing service upgrade"
                          curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
                            -X POST \
                            -H 'Accept: application/json' \
                            -H 'Content-Type: application/json' \
                            "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_FRONTEND?action=finishupgrade"
                          break ;;
                      "\"upgrading\"" )
                          echo "still upgrading"
                          echo -n "."
                          sleep 3
                          continue ;;
                      *)
                          die "unexpected upgrade state" ;;
                  esac
                done
