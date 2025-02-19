export const CONFIG = {
    embeddingDim: 32,
    numHeads: 2,
    ffDim: 64,
    vocabSize: 256,
    sequenceLength: 64,
    batchSize: 2,
    epochs: 200,
    learningRate: 0.001,
    temperature: 0.7
};

export class ChessTransformer {
    constructor() {
        this.model = null;
    }

    createAttentionLayer(numHeads, keyDim) {
        return function(inputs) {
            const queryLayer = tf.layers.dense({ units: keyDim });
            const keyLayer = tf.layers.dense({ units: keyDim });
            const valueLayer = tf.layers.dense({ units: keyDim });

            const query = queryLayer.apply(inputs);
            const key = keyLayer.apply(inputs);
            const value = valueLayer.apply(inputs);

            const attentionLayer = tf.layers.dense({ units: keyDim });
            const attention = attentionLayer.apply(query);
            const scaled = tf.layers.dense({ units: keyDim }).apply(attention);
            const weights = tf.layers.softmax().apply(scaled);
            
            const weightedSum = tf.layers.dense({ units: keyDim }).apply(weights);
            return tf.layers.dense({ units: CONFIG.embeddingDim }).apply(weightedSum);
        };
    }

    createTransformerBlock() {
        return function(inputs) {
            const attention = this.createAttentionLayer(CONFIG.numHeads, CONFIG.embeddingDim)(inputs);
            const add1 = tf.layers.add().apply([inputs, attention]);
            const norm1 = tf.layers.layerNormalization().apply(add1);

            const ff1 = tf.layers.dense({ units: CONFIG.ffDim, activation: 'relu' }).apply(norm1);
            const ff2 = tf.layers.dense({ units: CONFIG.embeddingDim }).apply(ff1);
            const add2 = tf.layers.add().apply([norm1, ff2]);
            return tf.layers.layerNormalization().apply(add2);
        }.bind(this);
    }

    buildModel() {
        const input = tf.input({shape: [CONFIG.sequenceLength]});
        
        const embedding = tf.layers.embedding({
            inputDim: CONFIG.vocabSize,
            outputDim: CONFIG.embeddingDim,
            inputLength: CONFIG.sequenceLength,
        });
        let x = embedding.apply(input);

        const posEmbedding = tf.layers.embedding({
            inputDim: CONFIG.sequenceLength,
            outputDim: CONFIG.embeddingDim,
            trainable: true,
        });
        
        const positions = tf.range(0, CONFIG.sequenceLength).expandDims(0);
        const posEmbedded = posEmbedding.apply(positions);
        
        x = tf.layers.add().apply([x, posEmbedded]);

        for (let i = 0; i < 2; i++) {
            x = this.createTransformerBlock()(x);
        }

        const output = tf.layers.dense({ 
            units: CONFIG.vocabSize, 
            activation: 'softmax' 
        }).apply(x);

        this.model = tf.model({ inputs: input, outputs: output });
        this.model.compile({
            optimizer: tf.train.adam(CONFIG.learningRate),
            loss: 'sparseCategoricalCrossentropy',
            metrics: ['accuracy']
        });
        return this.model;
    }

    preprocessData(data) {
        const maxLength = CONFIG.sequenceLength;
        let sequences = [];

        for (const line of data) {
            const charCodes = Array.from(line).map(char => char.charCodeAt(0));
            if (charCodes.length < maxLength) {
                const padding = Array(maxLength - charCodes.length).fill(0);
                sequences.push(charCodes.concat(padding));
            } else {
                sequences.push(charCodes.slice(0, maxLength));
            }
        }

        const xs = [];
        const ys = [];

        for (const sequence of sequences) {
            for (let i = 0; i < sequence.length - 1; i++) {
                xs.push(sequence.slice(0, sequence.length - 1));
                ys.push(sequence[i + 1]);
            }
        }

        return [tf.tensor2d(xs, [xs.length, CONFIG.sequenceLength -1]), tf.tensor1d(ys, 'int32')];
    }

    async train(data, onEpochEnd) {
        const [xs, ys] = this.preprocessData(data);
        const paddedXs = tf.pad(xs, [[0, 0], [0, 1]]);
        
        try {
            await this.model.fit(paddedXs, ys, {
                batchSize: CONFIG.batchSize,
                epochs: CONFIG.epochs,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (onEpochEnd) onEpochEnd(epoch, logs);
                    }
                }
            });
        } finally {
            xs.dispose();
            ys.dispose();
            paddedXs.dispose();
        }
    }

    async generate(prefix, length) {
        let charCodes = Array.from(prefix).map(char => char.charCodeAt(0));
        let inputSequence = charCodes.length < CONFIG.sequenceLength 
            ? charCodes.concat(Array(CONFIG.sequenceLength - charCodes.length).fill(0))
            : charCodes.slice(0, CONFIG.sequenceLength);

        let generated = prefix;
        let inputTensor = tf.tensor2d([inputSequence]);

        try {
            for (let i = 0; i < length; i++) {
                const predictions = this.model.predict(inputTensor);
                const logits = predictions.slice([0, CONFIG.sequenceLength - 1], [1, 1]).squeeze();
                const scaledLogits = tf.div(logits, CONFIG.temperature);
                const sampledIndex = tf.multinomial(scaledLogits, 1, null, false).dataSync()[0];

                const nextChar = String.fromCharCode(sampledIndex);
                generated += nextChar;

                inputSequence.shift();
                inputSequence.push(sampledIndex);

                inputTensor.dispose();
                inputTensor = tf.tensor2d([inputSequence]);

                predictions.dispose();
                scaledLogits.dispose();
                logits.dispose();
            }
        } finally {
            inputTensor.dispose();
        }
        return generated;
    }
}
