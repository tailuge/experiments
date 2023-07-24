import onnx
import onnxruntime as rt
import numpy as np
import torch
import torch.nn.functional as F

chars=['\n', ' ', '#', '+', '-', '1', '2', '3', '4', '5', '6', '7', '8', '=', 'B', 'K', 'N', 'O', 'Q', 'R', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'x']
vocab_size = len(chars)

print(chars)
print(vocab_size)

# create a mapping from characters to integers
stoi = { ch:i for i,ch in enumerate(chars) }
itos = { i:ch for i,ch in enumerate(chars) }
encode = lambda s: [stoi[c] for c in s] # encoder: take a string, output a list of integers
decode = lambda x: ''.join([itos[i] for i in x]) # decoder: take a list of integers, output a string


model = onnx.load("./model/chessgpt.onnx")
sess = rt.InferenceSession(model.SerializeToString())

input_name = sess.get_inputs()[0].name
print("input name", input_name)
input_shape = sess.get_inputs()[0].shape
print("input shape", input_shape)
input_type = sess.get_inputs()[0].type
print("input type", input_type)


output_name = sess.get_outputs()[0].name
print("output name", output_name)
output_shape = sess.get_outputs()[0].shape
print("output shape", output_shape)
output_type = sess.get_outputs()[0].type
print("output type", output_type)


def getNext(prompt):
    length = len(prompt)
    print(length)
    str = prompt.rjust(32)[:32]
    strEnc = encode(str)

    # Preprocess the input data
    input_data = np.array(strEnc, dtype=np.int64)  # Replace with your actual input data

    # Reshape the input data to match the model's input shape if needed
    input_data = input_data.reshape(input_shape)

    # Run the model
    output = sess.run([output_name], {input_name: input_data})

    output = output[0]  # Extract the output from the list

    # Focus only on the relavant time step
    logits = output[:, length+1, :]  # Shape: (B, C)

    # Apply softmax to get probabilities
    probs = F.softmax(torch.tensor(logits), dim=-1)  # Shape: (B, C)

    # Sample from the distribution
    idx_next = torch.multinomial(probs, num_samples=1)  # Shape: (B, 1)
    return decode(idx_next.tolist()[0])

prompt = "e4 e5 "
for _ in range(10):
    prompt += getNext(prompt)

print(prompt)