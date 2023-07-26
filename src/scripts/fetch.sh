#!/usr/bin/bash

echo "Fetch data from lichess"
echo ""

mkdir -p data
curl -r 0-1000000 https://database.lichess.org/standard/lichess_db_standard_rated_2023-03.pgn.zst --output data/raw.pgn.zst
unzstd data/raw.pgn.zst --stdout > data/all.txt
sed '$ d' data/all.txt | grep -E "^1. " | sed 's/{[^}]*}//g' | sed -r 's/[0-9]+[.]+ //g' | sed 's/  / /g' | \
    sed 's/[!?]*//g' | sed 's/ [012/-]*$//' | \
    grep -v '\*' | cut -d' ' -f1-16 | \
    sort | uniq > data/input.txt

wc -l data/input.txt
