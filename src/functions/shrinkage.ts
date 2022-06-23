// @ts-ignore
import BFGSAlgorithm from "bfgs-algorithm";
import chiquantile from "@stdlib/stats-base-dists-chisquare-quantile";

export interface Sample {
    expected: number;
    measured: number;
    inner: boolean;
}

export interface Compensation {
    shrinkage: number;
    shrinkageCh: number;
    shrinkageCl: number;

    growth: number;
    growthCh: number;
    growthCl: number;
}

function likelihoodFun(samples: Sample[]) {
    return (args: number[]) => {
        const [shrink, bleed, sigma] = args;
        let l = 6 * Math.log(1 / Math.sqrt(2 * Math.PI * sigma * sigma));
        for (const sample of samples) {
            let sgn = sample.inner ? -1 : 1;
            l =
                l -
                Math.pow(
                    sample.measured -
                        shrink * sample.expected +
                        2 * sgn * bleed,
                    2
                ) /
                    (2 * sigma * sigma);
        }
        return -l;
    };
}

function waldStat(
    lFun: (r: number[]) => number,
    args: number[],
    shrinkage: number,
    growth: number
) {
    let l = lFun(args);
    let newL = lFun([shrinkage, growth, args[2]]);
    return 2 * Math.log(l / newL);
}

function confidence(
    lFun: (r: number[]) => number,
    res: number[],
    confidenceInterval: number
) {
    let delta = chiquantile(confidenceInterval, 1);
    let result = {
        shrinkageCh: Number.NaN,
        shrinkageCl: Number.NaN,
        growthCh: Number.NaN,
        growthCl: Number.NaN,
    };

    for (let k = 10; k > 0; k--) {
        let u = waldStat(lFun, res, res[0] + 10 ** -k, res[1]);
        let v = waldStat(lFun, res, res[0] - 10 ** -k, res[1]);
        if (u < delta) result.shrinkageCh = res[0] + 10 ** -k;
        if (v < delta) result.shrinkageCl = res[0] - 10 ** -k;

        u = waldStat(lFun, res, res[0], res[1] + 10 ** -k);
        v = waldStat(lFun, res, res[0], res[1] - 10 ** -k);
        if (u < delta) result.growthCh = res[1] + 10 ** -k;
        if (v < delta) result.growthCl = res[1] - 10 ** -k;
    }
    return result;
}

export function evaluateSamples(samples: Sample[], confidenceInterval: number) {
    let lFun = likelihoodFun(samples);

    let opt = new BFGSAlgorithm(lFun, [1, 1, 1], {
        maxIterator: 1000,
        err: 1e-4,
    });
    let res = opt.run();
    let conf = confidence(lFun, res.x, confidenceInterval);

    return {
        shrinkage: res.x[0],
        growth: res.x[1],
        ...conf,
    };
}
