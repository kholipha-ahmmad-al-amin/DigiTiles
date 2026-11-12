param (
    [string]$Message = "",
    [switch]$SkipBuild,
    [switch]$SkipCloudflare,
    [switch]$SkipVercel
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  DIGITILES: CLOUDFLARE D1 + FIREBASE + GITHUB + VERCEL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Load configuration from deploy.json
$ConfigPath = Join-Path $PSScriptRoot "deploy.json"
if (-not (Test-Path $ConfigPath)) {
    Write-Host "Error: deploy.json not found in project root." -ForegroundColor Red
    exit 1
}

$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$RequiredEmail = $Config.auth.requiredEmail
$CfAccountId = $Config.cloudflare.accountId
$CfApiDomain = $Config.cloudflare.apiDomain
$FbProjectId = $Config.firebase.projectId
$RepoOwner = $Config.github.owner
$RepoName = $Config.github.repo
$FullRepo = "$RepoOwner/$RepoName"
$RemoteUrl = $Config.github.remoteUrl
$Branch = $Config.github.branch
$CommitMsg = if ($Message -ne "") { $Message } else { $Config.github.defaultCommitMessage }

Write-Host "[1/6] Verifying Dual-CLI Authentication ($RequiredEmail)..." -ForegroundColor Yellow

# Clear any stale cached Wrangler account ID before verifying
$WranglerCache = Join-Path $PSScriptRoot "node_modules\.cache\wrangler"
if (Test-Path $WranglerCache) {
    Remove-Item -LiteralPath $WranglerCache -Recurse -Force -ErrorAction SilentlyContinue
}
$env:CLOUDFLARE_ACCOUNT_ID = $CfAccountId

$ErrorActionPreference = "Continue"
$WranglerWhoami = (npx wrangler whoami 2>&1 | Out-String)
$FirebaseLoginList = (firebase login:list 2>&1 | Out-String)
$ErrorActionPreference = "Stop"

if ($WranglerWhoami -notmatch [Regex]::Escape($RequiredEmail)) {
    Write-Host "Error: Wrangler CLI is NOT logged in with $RequiredEmail." -ForegroundColor Red
    Write-Host $WranglerWhoami -ForegroundColor DarkGray
    Write-Host "Please run 'npx wrangler login' with $RequiredEmail and retry." -ForegroundColor Red
    exit 1
}
Write-Host "  Verified Wrangler CLI logged in as: $RequiredEmail (Account: $CfAccountId)" -ForegroundColor Green

if ($FirebaseLoginList -notmatch [Regex]::Escape($RequiredEmail)) {
    Write-Host "Error: Firebase CLI is NOT logged in with $RequiredEmail." -ForegroundColor Red
    Write-Host $FirebaseLoginList -ForegroundColor DarkGray
    Write-Host "Please run 'firebase login' with $RequiredEmail and retry." -ForegroundColor Red
    exit 1
}
Write-Host "  Verified Firebase CLI logged in as: $RequiredEmail (Project: $FbProjectId)" -ForegroundColor Green

# 2. Run Next.js production build verification
if ($Config.qualityGates.runBuildBeforeDeploy -and (-not $SkipBuild)) {
    Write-Host "[2/6] Running Next.js production build verification..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Production build failed. Fix compile errors before deploying." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "  Next.js production build succeeded." -ForegroundColor Green
} else {
    Write-Host "[2/6] Skipping local build step." -ForegroundColor DarkGray
}

# 3. Deploy Cloudflare Worker & Sync D1 Database
if ($Config.cloudflare.enabled -and (-not $SkipCloudflare)) {
    Write-Host "[3/6] Deploying Cloudflare Worker ($($Config.cloudflare.workerName)) & verifying D1 ($($Config.cloudflare.d1DatabaseName))..." -ForegroundColor Yellow
    $ErrorActionPreference = "Continue"
    npx wrangler deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Cloudflare Worker deployment failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    $ErrorActionPreference = "Stop"

    $HealthResp = Invoke-RestMethod -Uri "$CfApiDomain/health" -Method Get -TimeoutSec 20
    if ($HealthResp.stateVersion -eq 0 -or $HealthResp.relationalTables.users -eq 0) {
        Write-Host "  Seeding initial canonical state to Cloudflare D1 ($CfApiDomain)..." -ForegroundColor Cyan
        $ErrorActionPreference = "Continue"
        npx tsx -e "import { loadDatabase, syncDatabaseToCloudflareD1 } from './lib/store'; async function main() { await syncDatabaseToCloudflareD1(loadDatabase()); } main();"
        $ErrorActionPreference = "Stop"
        $HealthResp = Invoke-RestMethod -Uri "$CfApiDomain/health" -Method Get -TimeoutSec 20
    }
    Write-Host "  Cloudflare D1 Online ($CfApiDomain/health): State v$($HealthResp.stateVersion) | Users: $($HealthResp.relationalTables.users) | Listings: $($HealthResp.relationalTables.dealerListings) | Orders: $($HealthResp.relationalTables.orders)" -ForegroundColor Green
} else {
    Write-Host "[3/6] Skipping Cloudflare deployment step." -ForegroundColor DarkGray
}

# 4. Ensure GitHub repository exists via GitHub CLI
Write-Host "[4/6] Verifying GitHub repository ($FullRepo)..." -ForegroundColor Yellow
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

# 5. Create a fresh single commit (wiping all previous commit history)
Write-Host "[5/6] Creating a single fresh Git commit (wiping previous history)..." -ForegroundColor Yellow

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

# 6. Deploy to Vercel Production
if ($Config.vercel.enabled -and (-not $SkipVercel)) {
    Write-Host "[6/6] Deploying to Vercel Production ($($Config.cloudflare.platformDomain))..." -ForegroundColor Yellow
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
    Write-Host "[6/6] Skipping Vercel CLI deployment." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  DIGITILES PRODUCTION DEPLOYMENT PIPELINE COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "  Verified Account  : $RequiredEmail (Wrangler + Firebase)" -ForegroundColor White
Write-Host "  Live Platform URL : $($Config.cloudflare.platformDomain)" -ForegroundColor White
Write-Host "  3D Pitch Deck URL : $($Config.cloudflare.platformDomain)/pitch-deck" -ForegroundColor White
Write-Host "  Cloudflare D1 API : $CfApiDomain/health" -ForegroundColor White
Write-Host "  Firebase Project  : $FbProjectId" -ForegroundColor White
Write-Host "  GitHub Repository : https://github.com/$FullRepo (Single Commit)" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
