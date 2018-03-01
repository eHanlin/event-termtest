#!/bin/bash
if [[ ${TRAVIS_TAG} == *-SNAPSHOT ]]; then
    API_HOST='test.ehanlin.com.tw'
else
    API_HOST='www.ehanlin.com.tw'
fi

curl -X POST -H 'Content-Type: application/json' -d "{\"Repository\":\"event-termtest\",\"Tag\":\"${TRAVIS_TAG}\",\"Owner\":\"eHanlin\",\"Password\":\"${EHANLIN_PW}\", \"Name\": \"termtest\"}" "https://${API_HOST}/event/api/Deploy"
