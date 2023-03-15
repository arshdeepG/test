#!/bin/bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[,]//g')

echo $PACKAGE_VERSION

LATEST_COMMIT_ID=$(git rev-parse HEAD)
SHORT_LATEST_COMMIT_ID=$(git rev-parse --short HEAD)
BRANCH=$(git branch --show-current)

echo "Latest Commit ID: $LATEST_COMMIT_ID"
echo "Short Commit ID: $SHORT_LATEST_COMMIT_ID"

if [ "$2" == "add_branch" ]
then
json_data=$(cat <<EOF
{
  "version":$PACKAGE_VERSION,
  "latest_commit_id": "$LATEST_COMMIT_ID",
  "short_commit_id": "$SHORT_LATEST_COMMIT_ID",
  "branch": "$BRANCH",
  "environment": "$1"
}
EOF
)
else
  json_data=$(cat <<EOF
  {
    "version":$PACKAGE_VERSION,
    "latest_commit_id": "$LATEST_COMMIT_ID",
    "short_commit_id": "$SHORT_LATEST_COMMIT_ID",
    "environment": "$1"
  }
EOF
)
fi

echo "$json_data";

echo "$json_data" > ./public/version.json
