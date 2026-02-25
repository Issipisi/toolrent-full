@echo off
echo ========================================
echo     K6 TEST SUITE - TOOLRENT
echo ========================================
echo.
echo Backend: http://10.252.181.173:8090
echo Keycloak: http://localhost:8082
echo Realm: toolrent-realm
echo Client ID: toolrent-frontend
echo.
echo Presiona Ctrl+C para cancelar en cualquier momento
echo.
pause

echo.
echo ========================================
echo PASO 1: Verificando conexion basica
echo ========================================
ping -n 2 10.252.181.173 > nul
if %errorlevel% equ 0 (
    echo  Backend accesible
) else (
    echo  No se puede acceder al backend
    echo    Verifica que la IP sea correcta
    pause
    exit /b
)

echo.
echo ========================================
echo PASO 2: EPICA 2 - LOAD TESTING
echo ========================================
echo Probando con 10, 50, 100, 500, 1000 usuarios...
echo.
k6 run epica2/load-test.js
if %errorlevel% neq 0 (
    echo  Load testing completado con warnings
    pause
)
pause

echo.
echo ========================================
echo PASO 3: EPICA 2 - STRESS TESTING
echo ========================================
echo Buscando punto de quiebre (hasta 8000 usuarios)...
echo.
k6 run epica2/stress-test.js
if %errorlevel% neq 0 (
    echo  Stress testing completado con warnings
    pause
)
pause

echo.
echo ========================================
echo PASO 4: EPICA 2 - VOLUME TESTING
echo ========================================
echo Probando con diferentes volúmenes de BD...
echo.
k6 run epica2/volume-test.js
if %errorlevel% neq 0 (
    echo  Volume testing completado con warnings
    pause
)
pause

echo.
echo ========================================
echo PASO 5: EPICA 6 - LOAD TESTING
echo ========================================
echo Probando reportes...
echo.
k6 run epica6/load-test.js
if %errorlevel% neq 0 (
    echo  Load testing épica 6 completado con warnings
    pause
)
pause

echo.
echo ========================================
echo PASO 6: EPICA 6 - STRESS TESTING
echo ========================================
echo Buscando punto de quiebre en reportes...
echo.
k6 run epica6/stress-test.js
if %errorlevel% neq 0 (
    echo   Stress testing épica 6 completado con warnings
    pause
)

echo.
echo ========================================
echo PASO 7: EPICA 6 - VOLUME TESTING
echo ========================================
echo Probando reportes con diferentes volúmenes de BD...
echo.
k6 run epica6/volume-test.js
if %errorlevel% neq 0 (
    echo   Volume testing épica 6 completado con warnings
    pause
)

echo.
echo ========================================
echo  TODAS LAS PRUEBAS COMPLETADAS
echo ========================================
echo.
echo Revisa los resultados arriba
echo.
pause