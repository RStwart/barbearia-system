# Script PowerShell para executar migrações do banco de dados
# Execute este script como: .\executar_migracoes.ps1

Write-Host "=== Executando Migrações do Banco de Dados ===" -ForegroundColor Cyan

# Solicitar senha do MySQL
$senha = Read-Host "Digite a senha do MySQL (root)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($senha)
$senhaTexto = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host "`n1. Adicionando coluna 'avaliacao'..." -ForegroundColor Yellow
$sql1 = "ALTER TABLE agendamentos ADD COLUMN avaliacao INT DEFAULT NULL;"
mysql -u root -p$senhaTexto barbearia_db -e $sql1 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Coluna 'avaliacao' adicionada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ! Coluna 'avaliacao' já existe ou erro ao adicionar" -ForegroundColor Yellow
}

Write-Host "`n2. Adicionando coluna 'comentario_avaliacao'..." -ForegroundColor Yellow
$sql2 = "ALTER TABLE agendamentos ADD COLUMN comentario_avaliacao TEXT DEFAULT NULL;"
mysql -u root -p$senhaTexto barbearia_db -e $sql2 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Coluna 'comentario_avaliacao' adicionada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ! Coluna 'comentario_avaliacao' já existe ou erro ao adicionar" -ForegroundColor Yellow
}

Write-Host "`n3. Verificando estrutura da tabela..." -ForegroundColor Yellow
mysql -u root -p$senhaTexto barbearia_db -e "DESCRIBE agendamentos;"

Write-Host "`n=== Migrações Concluídas ===" -ForegroundColor Cyan
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
