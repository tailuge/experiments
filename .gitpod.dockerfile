FROM gitpod/workspace-full:latest

RUN echo "CI version from full"


### Python ###
USER gitpod
RUN sudo install-packages
RUN sudo apt update && sudo apt upgrade -y && sudo apt install zstd shellcheck -y
RUN pip install --upgrade pip && pip install numpy && pip install torch && pip install onnx && sudo rm -rf /tmp/*USER gitpod


