# Experiments

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/tailuge/experiments/blob/master/ChessGPT.ipynb)
[![Open in Gitpod](https://img.shields.io/badge/Gitpod-Open%20in%20Gitpod-%230092CF.svg)](https://gitpod.io/#https://github.com/tailuge/experiments)
[![CodeFactor](https://www.codefactor.io/repository/github/tailuge/experiments/badge)](https://www.codefactor.io/repository/github/tailuge/experiments)

## ChessGPT

* Tranformer decoder neural network applied to PGN chess move sequences
* Trained from human [lichess.org](lichess.org) games
* Inference using WebAssembly ONNX model in browser

If large language models internalise the world in an effort to predict the next word
with transformer networks, can they internalise chess
by predicting PGN 'words' from real games?

I think this would work but with only ~10000 parameters the results are hopeless.
Maybe someone who understands transformer architecture will
take this idea to a real implementation someday.

Onnx model for inference in web page deployed at [https://tailuge.github.io/experiments/dist/index.html](https://tailuge.github.io/experiments/dist/index.html)

### Dev

```shell
yarn deps
yarn upgrade -L
yarn shellcheck
yarn prettify
yarn black
yarn markdownlint
```

### Setup

Create a python virtual environment and install dependencies

```shell
yarn setup
```

Get a few thousand games from [lichess.org](lichess.org) database and sanitize

```shell
yarn fetch
```

### Train

Model is trained using python with ``pip`` installed
dependencies ``numpy``, ``torch`` and ``onnx`` (see requirements.txt)

```shell
yarn train
```

### Inference

In browser inference from ONNX model

```shell
yarn dev
yarn serve
```

### Plans

* add harness to produce legal next move by retrying or
    selecting random legal move if no legal move produced by model.
* hyper parameter tuning (on RaspberryPi 4b)
* host on render.com free tier and connect to lichess
* allow for hosting provider to do inference on webpage (via websocket)
