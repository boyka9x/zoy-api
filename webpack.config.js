import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    mode: 'production',
    optimization: {
        minimize: true,
    },
    entry: {
        record: './packages/record/index.js',
    },
    output: {
        filename: '[name].zoy.js',
        path: path.resolve(__dirname, 'src/public/cdn'),
    },
    target: ['web', 'es5'],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },
};

