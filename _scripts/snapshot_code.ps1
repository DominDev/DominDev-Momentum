# Zbiera caly kod projektu do jednego pliku Markdown.
# Autor: DominDev

param(
    [string]$OutputDir = "_project_snapshots"
)

$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$CurrentDirName = Split-Path $ScriptDir -Leaf

if ($CurrentDirName -match '^_') {
    $ProjectPath = Split-Path $ScriptDir -Parent
} else {
    $ProjectPath = $ScriptDir
}

$IncludedExtensions = @('.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.json', '.php', '.py', '.rb', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.swift', '.kt', '.kts', '.xml', '.xsl', '.xslt', '.yaml', '.yml', '.toml', '.md', '.markdown', '.txt', '.sql', '.sh', '.bash', '.bat', '.cmd', '.ps1', '.vue', '.svelte')
$ExcludedDirs = @('.git', '.vscode', '.idea', '.wrangler', '.gemini', '.claude', '.codex', '.gemini-clipboard', 'node_modules', '__pycache__', 'vendor', 'dist', 'build', '.next', '.nuxt', 'coverage', '.cache', 'tmp', 'temp', '_project_snapshots', '_docs', 'archive')
$ExcludedFiles = @('.gitignore', '.gitattributes', '.gitmodules', '.env', '.env*', '.DS_Store', 'Thumbs.db', 'desktop.ini', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock', 'Gemfile.lock', 'Cargo.lock', 'LICENSE', 'LICENSE*', 'CHANGELOG.md', '*.min.js', '*.min.css', '*.map', 'CLAUDE.md', 'GEMINI.md', 'CODEX.md')
$BinaryDirs = @('images', 'img', 'assets/images', 'assets/img', 'fonts', 'assets/fonts', 'media', 'videos', 'audio')
$LangMap = @{ '.js'='javascript'; '.mjs'='javascript'; '.cjs'='javascript'; '.jsx'='jsx'; '.ts'='typescript'; '.tsx'='tsx'; '.html'='html'; '.htm'='html'; '.css'='css'; '.scss'='scss'; '.sass'='sass'; '.less'='less'; '.json'='json'; '.ps1'='powershell'; '.bat'='batch'; '.cmd'='batch'; '.sh'='bash'; '.md'='markdown'; '.py'='python'; '.php'='php'; '.java'='java'; '.cs'='csharp'; '.go'='go'; '.rs'='rust'; '.xml'='xml'; '.yaml'='yaml'; '.yml'='yaml'; '.toml'='toml'; '.sql'='sql' }

function Test-IsDirExcluded {
    param($DirName, $RelativePath)
    if ($ExcludedDirs -contains $DirName) { return $true }
    foreach ($binDir in $BinaryDirs) {
        $normRel = $RelativePath.Replace('\', '/')
        if ($normRel -like ("*" + $binDir + "*")) { return $true }
    }
    return $false
}

function Test-IsFileExcluded {
    param($FileName)
    foreach ($pattern in $ExcludedFiles) {
        if ($pattern.Contains('*')) {
            if ($FileName -like $pattern) { return $true }
        } else {
            if ($FileName -eq $pattern) { return $true }
        }
    }
    return $false
}

function Test-IsCodeFile {
    param($FileName)
    $ext = [System.IO.Path]::GetExtension($FileName).ToLower()
    return $IncludedExtensions -contains $ext
}

function Get-LanguageTag {
    param($FileName)
    $ext = [System.IO.Path]::GetExtension($FileName).ToLower()
    if ($LangMap.ContainsKey($ext)) { return $LangMap[$ext] }
    return "" 
}

function Get-CodeFiles {
    param($Path, $RelativePath = ".")
    $files = @()
    try { $items = Get-ChildItem -Path $Path -Force -ErrorAction SilentlyContinue } catch { return $files }
    
    foreach ($item in $items) {
        $itemRelPath = if ($RelativePath -eq ".") { $item.Name } else { "$RelativePath/$($item.Name)" }
        
        if ($item.PSIsContainer) {
            if (-not (Test-IsDirExcluded -DirName $item.Name -RelativePath $itemRelPath)) {
                $files += Get-CodeFiles -Path $item.FullName -RelativePath $itemRelPath
            }
        } else {
            if ((Test-IsCodeFile -FileName $item.Name) -and (-not (Test-IsFileExcluded -FileName $item.Name))) {
                $files += @{ FullPath = $item.FullName; RelativePath = "./$itemRelPath"; Name = $item.Name }
            }
        }
    }
    return $files
}

# === START ===
$outputPath = Join-Path $ProjectPath $OutputDir
if (-not (Test-Path $outputPath)) { New-Item -ItemType Directory -Path $outputPath -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$projectName = Split-Path $ProjectPath -Leaf
$outputFile = Join-Path $outputPath "code_snapshot_$timestamp.md"

Write-Host "Skanowanie projektu..." -ForegroundColor Cyan
$codeFiles = Get-CodeFiles -Path $ProjectPath | Sort-Object { $_.RelativePath }
Write-Host ("Znaleziono " + $codeFiles.Count + " plikow kodowych.") -ForegroundColor Green

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# SNAPSHOT KODU: " + $projectName)
[void]$sb.AppendLine("> Data: " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
[void]$sb.AppendLine("> Pliki: " + $codeFiles.Count)
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## SPIS TRESCI")
foreach ($file in $codeFiles) {
    [void]$sb.AppendLine('- `' + $file.RelativePath + '`')
}
[void]$sb.AppendLine("")
[void]$sb.AppendLine("---")
[void]$sb.AppendLine("")

foreach ($file in $codeFiles) {
    Write-Host ("  Przetwarzanie: " + $file.RelativePath) -ForegroundColor Gray
    $lang = Get-LanguageTag -FileName $file.Name
    
    # Kuloodporna konkatenacja
    $headerPart1 = '### [FILE] `'
    $headerPart2 = '`'
    $header = $headerPart1 + $file.RelativePath + $headerPart2
    
    [void]$sb.AppendLine($header)
    
    [void]$sb.AppendLine('```' + $lang)
    
    try {
        # Wymuszenie UTF8
        $content = Get-Content -Path $file.FullPath -Raw -Encoding UTF8 -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($content)) {
            [void]$sb.AppendLine("// [PLIK PUSTY]")
        } else {
            [void]$sb.AppendLine($content.TrimEnd())
        }
    } catch {
        [void]$sb.AppendLine("// [BLAD ODCZYTU: " + $_.Exception.Message + "]")
    }
    
    [void]$sb.AppendLine('```')
    [void]$sb.AppendLine("")
}

[void]$sb.AppendLine("---")
[void]$sb.AppendLine('Wygenerowano automatycznie przez snapshot_code.ps1')

$utf8WithBom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($outputFile, $sb.ToString(), $utf8WithBom)

Write-Host ""
Write-Host ("Snapshot zapisany do: " + $outputFile) -ForegroundColor Cyan
$sizeKB = [math]::Round((Get-Item $outputFile).Length / 1KB, 2)
Write-Host ("Rozmiar: " + $sizeKB + " KB") -ForegroundColor Gray
