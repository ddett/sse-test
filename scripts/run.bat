set ENV=dev
set CERT_DIR=c:/users/mad/certs
set CERT_FILENAME=2041-localhost
set WEBSOCKET_URL=ws://localhost:8080

taskkill /F /IM node.exe
npm run debug
