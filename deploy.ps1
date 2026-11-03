param (
    [string]$Message = "",
    [switch]$SkipBuild,
    [switch]$SkipVercel
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DIGITILES: SINGLE-COMMIT GITHUB AND VERCEL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Load configuration from deploy.json
$ConfigPath = Join-Path $PSScriptRoot "deploy.json"
if (-not (Test-Path $ConfigPath)) {
    Write-Host "Error: deploy.json not found in project root." -ForegroundColor Red
    exit 1
}

$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$RepoOwner = $Config.github.owner
$RepoName = $Config.github.repo
$FullRepo = "$RepoOwner/$RepoName"
$RemoteUrl = $Config.github.remoteUrl
$Branch = $Config.github.branch
$CommitMsg = if ($Message -ne "") { $Message } else { $Config.github.defaultCommitMessage }

Write-Host "[1/5] Loaded deploy.json configuration for $FullRepo (Branch: $Branch)" -ForegroundColor Yellow

# 2. Run production build verification
if ($Config.qualityGates.runBuildBeforeDeploy -and (-not $SkipBuild)) {
    Write-Host "[2/5] Running Next.js production build verification..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Production build failed. Fix compile errors before deploying." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "  Production build succeeded." -ForegroundColor Green
} else {
    Write-Host "[2/5] Skipping local build step." -ForegroundColor DarkGray
}

# 3. Ensure GitHub repository exists via GitHub CLI
Write-Host "[3/5] Verifying GitHub repository ($FullRepo)..." -ForegroundColor Yellow
$ErrorActionPreference = "Continue"
gh repo view $FullRepo *> $null
$RepoExists = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = "Stop"

if (-not $RepoExists) {
    Write-Host "  Repository $FullRepo not found. Creating via GitHub CLI..." -ForegroundColor Cyan
    $VisibilityFlag = if ($Config.github.visibility -eq "private") { "--private" } else { "--public" }
    gh repo create $FullRepo $VisibilityFlag --description $Config.displayName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create GitHub repository $FullRepo." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "  Created GitHub repository: https://github.com/$FullRepo" -ForegroundColor Green
} else {
    Write-Host "  Verified existing repository: https://github.com/$FullRepo" -ForegroundColor Green
}

# 4. Create a fresh single commit (wiping all previous commit history)
Write-Host "[4/5] Creating a single fresh Git commit (wiping previous history)..." -ForegroundColor Yellow

if (-not (Test-Path (Join-Path $PSScriptRoot ".git"))) {
    git init -b $Branch | Out-Null
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if ((git remote) -contains "origin") {
    git remote set-url origin $RemoteUrl
} else {
    git remote add origin $RemoteUrl
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$FreshBranch = "deploy-" + [Guid]::NewGuid().ToString("N")
git checkout --orphan $FreshBranch
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git rm -rf --cached --ignore-unmatch . | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Exclude protected paths before any content enters the index.
function Test-ProtectedPath([string]$Path) {
    foreach ($Forbidden in $Config.qualityGates.forbiddenGitPaths) {
        if ($Path -like $Forbidden -or $Path -like "$Forbidden/*") {
            return $true
        }
    }
    return $false
}

$Candidates = @(git -c core.quotepath=false ls-files --others --exclude-standard)
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$StagePaths = @($Candidates | Where-Object { -not (Test-ProtectedPath $_) })
if ($StagePaths.Count -eq 0) { throw "No allowed files to commit." }

$Pathspec = New-TemporaryFile
try {
    [System.IO.File]::WriteAllLines($Pathspec.FullName, [string[]]$StagePaths, [System.Text.UTF8Encoding]::new($false))
    git --literal-pathspecs add --pathspec-from-file=$($Pathspec.FullName)
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Remove-Item -LiteralPath $Pathspec.FullName -Force
}

$StagedFiles = git diff --cached --name-only --no-renames
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$MatchesFound = $StagedFiles | Where-Object { Test-ProtectedPath $_ }
if ($MatchesFound) {
    Write-Host "Error: Restricted paths found in the Git index." -ForegroundColor Red
    exit 1
}

git commit -m "$CommitMsg" | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git branch -M $Branch
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "  Force-pushing single clean commit to origin/$Branch..." -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
git push -f origin $Branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Git push failed." -ForegroundColor Red
    exit $LASTEXITCODE
}
$ErrorActionPreference = "Stop"
Write-Host "  GitHub updated with a single fresh commit: https://github.com/$FullRepo" -ForegroundColor Green

# 5. Deploy to Vercel Production
if ($Config.vercel.enabled -and (-not $SkipVercel)) {
    Write-Host "[5/5] Deploying to Vercel Production..." -ForegroundColor Yellow
    $ErrorActionPreference = "Continue"
    $VercelProj = $Config.vercel.projectName.ToLower()
    if (-not (Test-Path (Join-Path $PSScriptRoot ".vercel\project.json"))) {
        vercel link --project $VercelProj --yes
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    vercel deploy --prod --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Vercel production deployment failed." -ForegroundColor Red
        exit $LASTEXITCODE
    } else {
        Write-Host "  Vercel Production deployment complete." -ForegroundColor Green
    }
    $ErrorActionPreference = "Stop"
} else {
    Write-Host "[5/5] Skipping Vercel CLI deployment." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  DIGITILES DEPLOYMENT PIPELINE COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "  GitHub Repository : https://github.com/$FullRepo" -ForegroundColor White
Write-Host "  Commit History    : Single fresh commit on branch '$Branch'" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
