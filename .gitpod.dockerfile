FROM gitpod/workspace-base:latest

RUN echo "CI version from base"


### Python ###
USER gitpod
RUN sudo apt update && sudo apt upgrade -y && sudo apt install zstd shellcheck -y
RUN sudo install-packages python3-pip
RUN pip install --upgrade pip && pip install numpy && pip install torch && pip install onnx && sudo rm -rf /tmp/*USER gitpod


