const ort = require("onnxruntime-web")
const tf = require("@tensorflow/tfjs")

const chars = [
  "\n",
  " ",
  "#",
  "+",
  "-",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "=",
  "B",
  "K",
  "N",
  "O",
  "Q",
  "R",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "x",
]
function encode(c) {
  return chars.indexOf(c)
}
function decode(n) {
  return chars[n]
}
function encodeString(str) {
  return str.split("").map(encode)
}
function decodeArray(arr) {
  return arr.map(decode).join("")
}
async function main() {
  try {
    // create a new session and load the specific model.
    document.write(`Loading model...`)
    const session = await ort.InferenceSession.create("./chessgpt.onnx")
    document.write(`Model loaded`)
    //        ort.env.debug = true;

    const inputNames = session.inputNames
    const outputNames = session.outputNames

    console.log("Model api:")
    console.log(`inputNames:${inputNames}`)
    console.log(`outputNames:${outputNames}`)

    const prefix = "e4 e5 "
    console.log(encodeString(prefix))
    console.log(decodeArray(encodeString(prefix)))

    const blockSize = 32
    const dataA = new BigInt64Array(blockSize)
    console.log(dataA)
    const tensorA = new ort.Tensor("int64", dataA, [1, 32])

    console.log("Input:")
    console.log("TensorA:")
    console.log(tensorA)
    // prepare feeds. use model input names as keys.
    const feeds = { context: tensorA }
    console.log(feeds)
    // feed inputs and run
    const results = await session.run(feeds)

    console.log("Model Output:")
    //      console.log(JSON.stringify(results))
    const outputArray = results.logits
    const outputTensorJs = tf.tensor(outputArray.data)
    console.log(`outputTensorJs ${outputTensorJs}`)
    const logits = outputTensorJs.reshape([1, 32, 29])
    console.log("shape:", logits.shape)
    logits.print()

    const lastRow = logits.slice([0, 0, 0], [1, 1, 29]) // Shape: [1, 1, 29]
    console.log("lastRow.shape:", lastRow.shape)
    const shapedLastRow = lastRow.reshape([29])
    shapedLastRow.print()
    shapedLastRow.print()

    // TensorflowJS to sample from the last row of the logits

    // Apply softmax to get probabilities
    const softmax = tf.softmax(shapedLastRow, -1) // Shape: [B, C]

    softmax.print()
    // Sample from the distribution
    const idx_next = tf.multinomial(softmax, 1) // Shape: [B, 1]

    idx_next.print()
    // read from results
    //        const dataC = results.c.data;
    //        document.write(`data of result tensor 'c': ${dataC}`);
  } catch (e) {
    console.log(`failed inference ONNX model: ${e}.`)
    document.write(`failed inference ONNX model: ${e}.`)
  }
}

main()
