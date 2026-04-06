@echo off
echo [CampusConnect] Yerel baslatma yardımcısı...

echo [1/3] Veritabanı kontrol ediliyor (Docker)...
docker-compose up -d postgres
if %errorlevel% neq 0 (
    echo [HATA] Docker Desktop acik mi? Veritabani baslatilamadi.
    pause
    exit /b
)

echo [2/3] NestJS servisi baslatiliyor (Local)...
cd nestjs-service
call npm install --legacy-peer-deps
call npx prisma generate
call npx prisma migrate deploy
start "NESTJS SERVICE" npm run start:dev
cd ..

echo [3/3] Go servisi baslatiliyor (Local)...
cd go-service
call go mod tidy
start "GO SERVICE" go run main.go
cd ..

echo [BASARILI] Servisler baslatildi! 
echo NestJS: http://localhost:3000
echo Go: http://localhost:8080
pause
