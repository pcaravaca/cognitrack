@echo off
cd "D:\Source Code\Main Repo\CogniTrack"
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python simple_server.py
