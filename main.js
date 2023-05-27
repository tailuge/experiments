
const ort = require('onnxruntime-web');

async function main() {
    try {
        console.log(`model loaded`);
        // create a new session and load the specific model.
        //
        // the model in this example contains a single MatMul node
        // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
        // it has 1 output: 'c'(float32, 3x3)
        const session = await ort.InferenceSession.create('./chessgpt.onnx');

        document.write(`inference`);

        console.log(session);
        console.log(ort);
        ort.env.debug = true;

        console.log(ort.registerBackend.name);

        const inputNames = session.inputNames;
        const outputNames = session.outputNames;

        console.log(`inputNames:${inputNames}`);
        console.log(`outputNames:${outputNames}`);

        const bigint64 = new BigInt64Array(2)
        // prepare inputs. a tensor need its corresponding TypedArray as data
        //  const dataA = Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        const dataA = new BigInt64Array(12);
        const tensorA = new ort.Tensor('int64', dataA, [1, 1]);

        // prepare feeds. use model input names as keys.
        const feeds = { 'input.1': tensorA };
        console.log(feeds);
        // feed inputs and run
        const results = await session.run(feeds);

        // read from results
        const dataC = results.c.data;
        document.write(`data of result tensor 'c': ${dataC}`);

    } catch (e) {
        console.log(`failed inference ONNX model: ${e}.`);
        document.write(`failed inference ONNX model: ${e}.`);
    }
}

main();