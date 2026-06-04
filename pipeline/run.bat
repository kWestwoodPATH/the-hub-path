@echo off
REM Weekly Job Report Pipeline - Windows Task Scheduler entry point.
REM Runs weekly via Task Scheduler. Writes data/jobs.js to the Hub repo and pushes.

cd /d "%~dp0"
set FIRECRAWL_API_KEY=
call .venv\Scripts\activate.bat
REM --skip-employers: the employer-page scraper emits page images/headshots/nav
REM links instead of real jobs (disabled 2026-06-01). Re-enable only after the
REM employers source is rewritten to parse actual postings. Job Bank is the live source.
python -m src.main --prod --push --skip-employers >> data\run-log.txt 2>&1
deactivate