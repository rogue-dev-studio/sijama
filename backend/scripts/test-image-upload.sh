#!/bin/sh
set -e

php -r "file_put_contents('/tmp/test.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='));"

TOKEN=$(curl -s -X POST http://127.0.0.1/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@sijama.local","password":"password"}' \
  | php -r 'echo json_decode(file_get_contents("php://stdin"))->data->token ?? "";')

echo "LOGIN_OK"

UPLOAD=$(curl -s -X POST "http://127.0.0.1/api/aplikasi/konfig/assets/logo-header" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.png;type=image/png")

PATH_VAL=$(echo "$UPLOAD" | php -r 'echo json_decode(file_get_contents("php://stdin"))->data->path_logoheader ?? "";')

if [ -z "$PATH_VAL" ]; then
  echo "UPLOAD_FAILED: $UPLOAD"
  exit 1
fi

echo "UPLOAD_PATH=$PATH_VAL"

curl -s -o /dev/null -w "IMG_HTTP=%{http_code} CT=%{content_type}\n" "http://127.0.0.1${PATH_VAL}"

# Profile photo upload
PHOTO=$(curl -s -X POST "http://127.0.0.1/api/profile/photo" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.png;type=image/png")

PHOTO_PATH=$(echo "$PHOTO" | php -r 'echo json_decode(file_get_contents("php://stdin"))->data->profile_photo_path ?? json_decode(file_get_contents("php://stdin"))->data->path_foto ?? "";')

echo "PHOTO_RESP=$PHOTO"

if [ -n "$PHOTO_PATH" ]; then
  curl -s -o /dev/null -w "PHOTO_HTTP=%{http_code} CT=%{content_type}\n" "http://127.0.0.1${PHOTO_PATH}"
fi
