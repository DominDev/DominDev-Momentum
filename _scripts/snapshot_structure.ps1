param(
    [string]$OutputDir = "_project_snapshots"
)

<#
.SYNOPSIS
    Generuje plik Markdown ze struktura katalogow projektu.
.NOTES
    Autor: DominDev
#>

$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$CurrentDirName = Split-Path $ScriptDir -Leaf

if ($CurrentDirName -match '^_') {
    $ProjectPath = Split-Path $ScriptDir -Parent
} else {
    $ProjectPath = $ScriptDir
}

$FullyIgnoredDirs = @('.git', '.vscode', '.idea', '.wrangler', '.gemini', '.claude', '.codex', '.gemini-clipboard', 'node_modules', '__pycache__', 'dist', 'build', '.next', '.nuxt', 'coverage', '.cache', 'tmp', 'temp', '_project_snapshots', 'archive')
$ShallowDirs = @('_docs', 'assets/fonts', 'assets/images')
$ExcludedFiles = @('.DS_Store', 'Thumbs.db', 'desktop.ini', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '*.log', 'CLAUDE.md', 'GEMINI.md', 'CODEX.md')

function Test-IsIgnored {
    param($Name, $IsDirectory)
    if ($IsDirectory) { return $FullyIgnoredDirs -contains $Name }
    foreach ($pattern in $ExcludedFiles) {
        if ($pattern.Contains('*')) { if ($Name -like $pattern) { return $true } }
        elseif ($Name -eq $pattern) { return $true }
    }
    return $false
}

function Test-IsShallowDir {
    param($RelativePath)
    $normPath = $RelativePath.Replace('\', '/')
    foreach ($shallow in $ShallowDirs) {
        if ($normPath -eq $shallow -or $normPath -like "*/$shallow") { return $true }
    }
    return $false
}

function Get-Tree {
    param($Path, $Prefix = "", $RelativePath = "")
    $output = @()
    try { $items = Get-ChildItem -Path $Path -Force -ErrorAction SilentlyContinue | Sort-Object { -not $_.PSIsContainer }, Name } catch { return $output }
    $filteredItems = $items | Where-Object { -not (Test-IsIgnored -Name $_.Name -IsDirectory $_.PSIsContainer) }
    $count = $filteredItems.Count
    $index = 0
    foreach ($item in $filteredItems) {
        $index++
        $isLast = ($index -eq $count)
        $connector = if ($isLast) { "+-- " } else { "|-- " }
        $childPrefix = if ($isLast) { "    " } else { "|   " }
        $itemRelPath = if ($RelativePath -eq "") { $item.Name } else { "$RelativePath/$($item.Name)" }
        $sizeInfo = ""
        if (-not $item.PSIsContainer) {
            $sizeKB = [math]::Round($item.Length / 1KB, 1)
            if ($sizeKB -gt 0) { $sizeInfo = " (" + $sizeKB + " KB)" }
        }
        $line = $Prefix + $connector + $item.Name + $sizeInfo
        if ($item.PSIsContainer) {
            $line += "/"
            if (Test-IsShallowDir -RelativePath $itemRelPath) {
                $line += " ..."
                $output += $line
            } else {
                $output += $line
                $output += Get-Tree -Path $item.FullName -Prefix ($Prefix + $childPrefix) -RelativePath $itemRelPath
            }
        } else { $output += $line }
    }
    return $output
}

$outputPath = Join-Path $ProjectPath $OutputDir
if (-not (Test-Path $outputPath)) { New-Item -ItemType Directory -Path $outputPath -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = Join-Path $outputPath "structure_snapshot_$timestamp.md"
$projectName = Split-Path $ProjectPath -Leaf

$content = @()
$content += "# STRUKTURA PROJEKTU: " + $projectName
$content += "> Data: " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
$content += ""
$content += '```text'
$content += $projectName + "/"
$content += Get-Tree -Path $ProjectPath
$content += '```'
$content += ""
$content += 'Wygenerowano przez snapshot_structure.ps1'

$finalContent = $content -join [Environment]::NewLine
$utf8WithBom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($outputFile, $finalContent, $utf8WithBom)

Write-Host ('Snapshot struktury zapisany do: ' + $outputFile) -ForegroundColor Cyan