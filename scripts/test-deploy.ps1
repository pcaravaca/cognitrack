# Script de prueba de parámetros
[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = $null,
    
    [Parameter(Mandatory=$false)]
    [int]$SshPort = 22,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "peter"
)

Write-Host "Parámetros recibidos:"
Write-Host "- ServerIP: $ServerIP"
Write-Host "- SshPort: $SshPort"
Write-Host "- Username: $Username"
