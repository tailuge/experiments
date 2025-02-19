export const CONFIG = {
    vocabSize: 128,  // ASCII range
    dModel: 64,
    maxSeqLen: 64,   // Increased for chess notation length
    numHeads: 4,
    ffDim: 128,
    numLayers: 2,    // Increased for better text modeling
    batchSize: 4
};

class TextEncoder {
    encode(text) {
        return Array.from(text).map(char => char.charCodeAt(0));
    }
    
    decode(codes) {
        return String.fromCharCode(...codes);
    }
}

export const encoder = new TextEncoder();

class PositionalEncodingLayer extends tf.layers.Layer {
    static className = 'PositionalEncodingLayer';
    
    constructor(config) {
        super({
            name: 'positional_encoding',
            trainable: false,
        });
        this.seqLen = config.maxSeqLen;
        this.dModel = config.dModel;
    }
    
    computeOutputShape(inputShape) {
        return inputShape;
    }
    
    getConfig() {
        const config = super.getConfig();
        return {
            ...config,
            seqLen: this.seqLen,
            dModel: this.dModel
        };
    }

    build(inputShape) {
        // Create primitive array for positional encoding
        const pe = new Array(this.seqLen).fill(0).map((_, pos) => {
            const row = new Array(this.dModel).fill(0);
            for (let i = 0; i < this.dModel; i += 2) {
                const freq = 1.0 / Math.pow(10000, i / this.dModel);
                row[i] = Math.sin(pos * freq);
                if (i + 1 < this.dModel) {
                    row[i + 1] = Math.cos(pos * freq);
                }
            }
            return row;
        });

        // Replace addWeight with direct tensor variable creation to fix initializer error
        this.encoding = tf.variable(tf.tensor2d(pe, [this.seqLen, this.dModel]), false);
    }
    
    call(inputs) {
        return tf.tidy(() => {
            const encoded = this.encoding.read();
            return tf.add(inputs, encoded.expandDims(0));
        });
    }
}

function multiHeadSelfAttention(x, numHeads, dModel) {
    const batchSize = x.shape[0];
    const seqLen = x.shape[1];
    const headDim = dModel / numHeads;

    // Create dense layers for query, key, and value
    const queryDenseLayer = tf.layers.dense({units: dModel, useBias: false});
    const keyDenseLayer = tf.layers.dense({units: dModel, useBias: false});
    const valueDenseLayer = tf.layers.dense({units: dModel, useBias: false});

    const q = queryDenseLayer.apply(x);
    const k = keyDenseLayer.apply(x);
    const v = valueDenseLayer.apply(x);

    // Updated reshape function using instanceof check for tensors.
    const reshapeToHeads = (t) => {
        const tensorT = (t instanceof tf.Tensor) ? t : tf.tensor(t);
        return tf.transpose(tf.reshape(tensorT, [batchSize, seqLen, numHeads, headDim]), [0, 2, 1, 3]);
    };

    const qHeads = reshapeToHeads(q);
    const kHeads = reshapeToHeads(k);
    const vHeads = reshapeToHeads(v);

    const attention = tf.tidy(() => {
        const scores = tf.matMul(qHeads, kHeads, false, true);
        const scaled = tf.div(scores, Math.sqrt(headDim));
        
        // Create causal mask
        const mask = tf.tidy(() => {
            const maskMatrix = new Array(seqLen).fill(0).map((_, i) => 
                new Array(seqLen).fill(0).map((_, j) => j <= i ? 0 : -1e9)
            );
            return tf.tensor(maskMatrix).expandDims(0).expandDims(0);
        });
        
        const masked = tf.add(scaled, mask);
        const weights = tf.softmax(masked, -1);
        return tf.matMul(weights, vHeads);
    });

    const concatenated = tf.reshape(tf.transpose(attention, [0, 2, 1, 3]), [batchSize, seqLen, dModel]);
    
    // Use a single dense layer to combine heads.
    return tf.layers.dense({units: dModel}).apply(concatenated);
}

function feedForwardNetwork(x) {
    return tf.tidy(() => {
        const hidden = tf.layers.dense({
            units: CONFIG.ffDim,
            activation: 'relu'
        }).apply(x);
        return tf.layers.dense({
            units: CONFIG.dModel
        }).apply(hidden);
    });
}

export function preprocessData(textLines) {
    const xs = [];
    const ys = [];
    
    for (const line of textLines) {
        const encoded = encoder.encode(line);
        if (encoded.length >= CONFIG.maxSeqLen) {
            continue; // Skip sequences that are too long
        }
        
        // Pad sequence
        const padded = encoded.concat(new Array(CONFIG.maxSeqLen - encoded.length).fill(0));
        
        // Create input/output pairs for each position
        for (let i = 1; i < encoded.length; i++) {
            const input = padded.slice(0, i);
            const padLength = CONFIG.maxSeqLen - input.length;
            const paddedInput = input.concat(new Array(padLength).fill(0));
            xs.push(paddedInput);
            ys.push(encoded[i]);
        }
    }
    
    return {
        xs: tf.tensor2d(xs, [xs.length, CONFIG.maxSeqLen], 'int32'),
        ys: tf.tensor1d(ys, 'int32')
    };
}

export function buildTransformerModel() {
    const input = tf.input({shape: [CONFIG.maxSeqLen]});
    
    let x = tf.layers.embedding({
        inputDim: CONFIG.vocabSize,
        outputDim: CONFIG.dModel,
        maskZero: true
    }).apply(input);

    x = new PositionalEncodingLayer(CONFIG).apply(x);

    // Add transformer blocks
    for (let i = 0; i < CONFIG.numLayers; i++) {
        const attention = multiHeadSelfAttention(x, CONFIG.numHeads, CONFIG.dModel);
        const attnNorm = tf.layers.layerNormalization().apply(
            tf.layers.add().apply([x, attention])
        );

        const ffn = feedForwardNetwork(attnNorm);
        x = tf.layers.layerNormalization().apply(
            tf.layers.add().apply([attnNorm, ffn])
        );
    }

    // Output layer predicts next character
    const output = tf.layers.dense({
        units: CONFIG.vocabSize,
        activation: 'softmax'
    }).apply(x);

    const model = tf.model({inputs: input, outputs: output});
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });
    
    return model;
}

export async function generateText(model, startText, length = 32) {
    let input = encoder.encode(startText);
    let generated = startText;

    for (let i = 0; i < length; i++) {
        const padded = input.concat(new Array(CONFIG.maxSeqLen - input.length).fill(0));
        const inputTensor = tf.tensor2d([padded], [1, CONFIG.maxSeqLen]);
        
        const prediction = await model.predict(inputTensor).data();
        
        // Sample from the predicted distribution
        const nextIndex = tf.multinomial(
            tf.tensor1d(Array.from(prediction)), 
            1
        ).dataSync()[0];
        
        const nextChar = String.fromCharCode(nextIndex);
        generated += nextChar;
        
        // Update input for next prediction
        input = encoder.encode(generated.slice(-CONFIG.maxSeqLen));
        
        inputTensor.dispose();
    }
    
    return generated;
}
