#!/bin/bash
curl -X POST -H 'Content-Type: application/json' -d "{\"Repository\":\"event-termtest\",\"Tag\":\"${TRAVIS_TAG}\",\"Owner\":\"eHanlin\",\"Password\":\"${EHANLIN_PW}\", \"Name\": \"termtest\"}" 'https://www.ehanlin.com.tw/event/api/Deploy'
