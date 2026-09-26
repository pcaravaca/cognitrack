#!/bin/bash

# Verificar si el usuario ya existe en sudoers
if ! sudo grep -q "^peter" /etc/sudoers.d/peter_sudo 2>/dev/null; then
    # Crear archivo de configuración temporal
    echo 'peter ALL=(ALL) NOPASSWD: ALL' | sudo tee /etc/sudoers.d/peter_sudo >/dev/null
    
    # Establecer permisos seguros
    sudo chmod 440 /etc/sudoers.d/peter_sudo
    sudo chown root:root /etc/sudoers.d/peter_sudo
    
    echo "Configuración de sudo completada. Ya no se te pedirá contraseña para comandos sudo."
else
    echo "La configuración de sudo ya estaba aplicada."
fi
