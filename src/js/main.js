const ort = require("onnxruntime-web")
const tf = require("@tensorflow/tfjs")

import { generateNextFrom } from "./generate"
import { encodeString, decodeArray } from "./encode"

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
    const encoded = encodeString(prefix)
    console.log(encoded)
    console.log(decodeArray(encoded))

    const blockSize = 32
    const dataA = new BigInt64Array(blockSize)
    encoded.forEach((x, i) => (dataA[i] = BigInt(x)))
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

    // TensorflowJS to sample from the last row of the logits

    // Apply softmax to get probabilities
    const softmax = tf.softmax(shapedLastRow, -1) // Shape: [B, C]

    softmax.print()
    // Sample from the distribution
    const idx_next = tf.multinomial(softmax, 1) // Shape: [B, 1]

    idx_next.print()

    const tensorData = idx_next.dataSync()
    console.log(tensorData)
    var a = [tensorData[0]]
    console.log(a)
    console.log(`Decoded as ${decodeArray(a)}`)
    // read from results
    //        const dataC = results.c.data;
    //        document.write(`data of result tensor 'c': ${dataC}`);
    console.log(generateNextFrom("e4 e5 ", session))
  } catch (e) {
    console.log(`failed inference ONNX model: ${e}.`)
    document.write(`failed inference ONNX model: ${e}.`)
  }
}

main()
