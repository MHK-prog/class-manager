@echo off
setlocal

cd /d "%~dp0"
if errorlevel 1 goto failed

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ERROR: Keep this file in the repository root.
  goto failed
)

git rev-parse --verify -q REBASE_HEAD >nul 2>&1
if not errorlevel 1 (
  echo ERROR: A Git rebase is already in progress. Resolve it before running this file again.
  goto failed
)

set "HAS_CHANGES="
for /f "delims=" %%A in ('git status --porcelain') do set "HAS_CHANGES=1"

if defined HAS_CHANGES (
  echo Staging and committing repository changes...
  git add -A
  if errorlevel 1 goto failed

  git commit -m "Auto update from push script"
  if errorlevel 1 goto failed
) else (
  echo No local file changes to commit.
)

echo Syncing the current branch with its upstream...
git pull --rebase
if errorlevel 1 (
  echo.
  echo Pull or rebase did not complete. Resolve any reported conflicts, then run this file again.
  goto failed
)

echo Pushing to the upstream repository...
git push
if errorlevel 1 goto failed

echo.
echo Push completed successfully.
pause
exit /b 0

:failed
echo.
echo Push did not complete. Check the Git output above.
pause
exit /b 1
