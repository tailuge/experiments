#!/usr/bin/bash
curl -r 0-1000000 https://database.lichess.org/standard/lichess_db_standard_rated_2023-03.pgn.zst --output raw.pgn.zst
unzstd raw.pgn.zst --stdout > all.txt
cat all.txt | sed '$ d' | grep -E "^1. " | sed 's/{[^}]*}//g' | sed -r 's/[0-9]+[.]+ //g' | sed 's/  / /g' | sed 's/[!?]*//g' | sed 's/ [012/-]*$//' | grep -v '*' | cut -d' ' -f1-16 > input.txt
wc -l input.txt
cat input.txt | sort | uniq | wc -l
