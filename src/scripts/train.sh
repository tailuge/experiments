#!/usr/bin/bash

echo "Activate python virtual environment"
echo ""
source venv/bin/activate

echo "Train"
echo ""
python ./src/python/train.py
