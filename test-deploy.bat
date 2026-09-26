@echo off
echo Probando conexión SSH...
ssh -p 2222 peter@10.10.1.210 "echo ¡Conexión exitosa!"

if %ERRORLEVEL% EQU 0 (
    echo Prueba de conexión exitosa
    
    echo Creando directorio remoto...
    ssh -p 2222 peter@10.10.1.210 "mkdir -p /home/peter/cognitrack"
    
    echo Enviando un archivo de prueba...
    echo "Prueba de despliegue" > test.txt
    scp -P 2222 test.txt peter@10.10.1.210:/home/peter/cognitrack/
    
    if %ERRORLEVEL% EQU 0 (
        echo ¡Archivo de prueba enviado correctamente!
        echo Verificando el archivo...
        ssh -p 2222 peter@10.10.1.210 "cat /home/peter/cognitrack/test.txt"
    )
) else (
    echo Error en la conexión
)

del test.txt 2>nul
pause
