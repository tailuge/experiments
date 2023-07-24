FROM gitpod/workspace-full:latest

RUN echo "Start version from full"


### Python ###
USER gitpod
RUN sudo install-packages zstd shellcheck
RUN pip install --upgrade pip && pip install numpy && pip install torch && pip install onnx && pip install onnxruntime && pip install black && sudo rm -rf /tmp/*USER gitpod


