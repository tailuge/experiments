experiments
===========

ChessGPT [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/tailuge/experiments/blob/master/ChessGPT.ipynb)
 [![Open in Gitpod](https://img.shields.io/badge/Gitpod-Open%20in%20Gitpod-%230092CF.svg)](https://gitpod.io/#https://github.com/tailuge/experiments)
 
If large language models internalise the world in an effort to predict the next word with transformer networks, can they internalise chess by predicting PGN 'words' from real games.
I think this would work but with only ~10000 parameters the results are hopeless. Maybe someone who understands transformer architecture will take this idea to a real implementation someday.


# Dev
```
yarn deps
yarn shellcheck
```
# Setup
```
yarn fetch
```
# Train
```
yarn train
```
# Inference
