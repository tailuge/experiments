#!/usr/bin/bash

echo "Setup python virtual environment"
echo ""

mkdir -p venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
