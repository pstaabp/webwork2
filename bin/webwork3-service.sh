#!/bin/bash

# if [[ `id -nu` != "www-data" ]];then
#    echo "Not www-data user, exiting.."
#    exit 1
# fi

export WEBWORK_ROOT=/opt/webwork/webwork2

/usr/local/bin/plackup -E development /opt/webwork/webwork2/webwork3/bin/app.psgi
