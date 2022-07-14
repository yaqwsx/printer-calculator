import { sample } from "lodash";
import { useState } from "react";
import { produce } from "immer";
import { evaluateSamples, Sample } from "../functions/shrinkage";

import { TextInput, ToggleSwitch, Tooltip } from "flowbite-react";

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function Shrinkage() {
    const [samples, setSamples] = useState<Sample[]>(
        Array.from(Array(6)).map((_, idx) => {
            return {
                expected: [20, 50, 100][idx % 3],
                measured: Number.NaN,
                inner: idx >= 3,
            };
        })
    );

    let result = undefined;
    let warning = undefined;
    try {
        result = evaluateSamples(samples, 0.95);
        if (
            result.growthCh - result.growthCl > 0.1 ||
            result.shrinkageCh - result.shrinkageCl > 0.001
        ) {
            warning = (
                <>
                    Your measurements are probably imprecise, thus the computed
                    values below are not reliable. Please, try taking the
                    measurements again.
                </>
            );
        }
    } catch (e) {
        if (e === "can't find approximate stepsize")
            warning = (
                <>
                    The computation failed. This is probably a bug and you
                    should report it on the{" "}
                    <a href="https://github.com/yaqwsx/printer-calculator">
                        {" "}
                        project's Github
                    </a>
                    . However, at the moment, try tweaking some of the number a
                    little – it might help.
                </>
            );
        console.log(samples);
        console.log(e);
    }

    return (
        <>
            <h1>Compensating resin shrinkage</h1>
            <p>
                When resin cures, it shrinks. That means that if a model in
                slicer has 50 mm it possible that it will only have 49.5 mm
                after it is printed and properly cured. You can read more in the{" "}
                <a href="https://blog.honzamrazek.cz/2022/06/getting-perfectly-crisp-and-dimensionally-accurate-3d-prints-on-a-resin-printer-fighting-resin-shrinkage-and-exposure-bleeding/">
                    corresponding blog post.
                </a>{" "}
            </p>
            <p>
                This calculator allows you to estimate the resin shrinkage and
                exposure bleeding based on a small printed test piece. You will
                get two values you can put into the slicer to compensate for it.
                Just follow the three steps:
            </p>
            <h2>1. Print the test model</h2>
            <p>
                The model is available at{" "}
                <a href="https://www.printables.com/model/230621">
                    Printables.com.
                </a>{" "}
                You can either choose from a stand-alone version to print
                directly (left) or a mold-pattern if you want to compensate for
                silicone casting (right). You can print the model in any
                orientation (X/Y) and you should always get the same numbers.
                Also, print the test piece directly on the build plate without
                any supports.
            </p>
            <p>
                Print the model as usual. I advice to add sufficient rest times
                to{" "}
                <a href="https://blog.honzamrazek.cz/2022/01/prints-not-sticking-to-the-build-plate-layer-separation-rough-surface-on-a-resin-printer-resin-viscosity-the-common-denominator/">
                    prevent blooming.
                </a>{" "}
                Otherwise you will not measure how much exposure does the resin
                bleed, but how much your printer is blooming.
            </p>
            <div className="my-2 flex w-full">
                <div className="w-1/2 pr-2">
                    <a href="https://www.printables.com/model/230621">
                        <img
                            src="assets/calib-standalone.png"
                            alt="The test-piece"
                        />
                    </a>
                </div>
                <div className="w-1/2 pl-2">
                    <a href="https://www.printables.com/model/230621">
                        <img
                            src="assets/calib-mold.png"
                            alt="The test-piece mold"
                        />
                    </a>
                </div>
            </div>
            <h2>2. Measure it and enter values below:</h2>
            <p>
                Tip: you can hover on the measurement name to see an
                illustration of what to measure. If you would like to also gain
                extra precision (though, this is not usually needed as 6
                measurements yield enough information), you can add extra
                measurements, e.g., between O1 and O2. Use button at the bottom
                to add extra fields.
            </p>
            <SamplesForm samples={samples} setSamples={setSamples} />
            <h2>3. Slicer compensation values</h2>
            {!result && (
                <p>
                    Please fill in all the measurements above to calculate the
                    compensation parameters.
                </p>
            )}
            {warning && (
                <div className="mb-4 w-full rounded border-2 border-orange-500 bg-orange-200 p-4 text-orange-800">
                    {warning}
                </div>
            )}
            {result && (
                <div className="table w-full">
                    <div className="table-row">
                        <div className="table-cell pr-2 text-right font-bold">
                            Resin linear shrinkage: 
                        </div>
                        <div className="table-cell">
                            <Tooltip
                                content="All linear dimension of the resin are shrank by this amount"
                                style="light"
                            >
                                {((1 - result.shrinkage) * 100).toFixed(3)} %
                            </Tooltip>
                        </div>
                        <div className="table-cell pl-4 text-gray-600">
                            <Tooltip
                                content={
                                    <>
                                        Expresses how good your measurements
                                        are. The smaller the range, the better
                                        measurements.
                                        <br /> If it is bigger than 0.05 %, you
                                        should repeat your measurements.
                                    </>
                                }
                                style="light"
                            >
                                (95% confidence on interval 
                                {((1 - result.shrinkageCh) * 100).toFixed(3)}% —{" "}
                                {((1 - result.shrinkageCl) * 100).toFixed(3)}%)
                            </Tooltip>
                        </div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell pr-2 text-right font-bold">
                            Exposure bleeding: 
                        </div>
                        <div className="table-cell">
                            <Tooltip
                                content="The walls of the print are offset by this amount"
                                style="light"
                            >
                                {(result.growth * 1000).toFixed(1)}µm
                            </Tooltip>
                        </div>
                        <div className="table-cell pl-4  text-gray-600">
                            <Tooltip
                                content={
                                    <>
                                        Expresses how good your measurements
                                        are. The smaller the range, the better
                                        measurements.
                                        <br /> If it is bigger than 50 µm, you
                                        should repeat your measurements.
                                    </>
                                }
                                style="light"
                            >
                                (95% confidence on interval 
                                {(result.growthCl * 1000).toFixed(1)}µm —{" "}
                                {(result.growthCh * 1000).toFixed(1)}µm)
                            </Tooltip>
                        </div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell pr-2 text-right font-bold">
                            XY model scale to compensate:
                        </div>
                        <div className="table-cell">
                            <Tooltip
                                content={
                                    <>
                                        Set this scale in slicer
                                        <img
                                            src="assets/scale.png"
                                            className="w-full"
                                            alt="Slicer settings image"
                                        />
                                    </>
                                }
                                style="light"
                            >
                                {((1 / result.shrinkage) * 100).toFixed(2)}%
                            </Tooltip>
                        </div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell pr-2 text-right font-bold">
                            Tolerance compensation:
                        </div>
                        <div className="table-cell">
                            <Tooltip
                                content={
                                    <>
                                        Set this compensation in slicer. If it
                                        is less than 0.05 mm, ignore it. Fill in both, inner and outer dimensions the same.
                                        <img
                                            src="assets/tolerance_compensation.png"
                                            className="w-full"
                                            alt="Slicer settings image"
                                        />
                                    </>
                                }
                                style="light"
                            >
                                {result.growth.toFixed(3)} mm
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function SampleTooltip(props: { index: number; children: any }) {
    if (props.index > 5) return <>{props.children}</>;
    let name =
        props.index < 3 ? `O${props.index + 1}` : `I${(props.index % 3) + 1}`;
    return (
        <Tooltip
            style="light"
            content={
                <img
                    src={`assets/${name}.png`}
                    className="max-w-screen-sm bg-white"
                    alt="Illustration of the measurement"
                />
            }
        >
            <span className="cursor-pointer">{props.children}</span>
        </Tooltip>
    );
}

function SampleName(props: { index: number }) {
    if (props.index < 3) {
        return <span>O{props.index + 1}</span>;
    }
    if (props.index < 6) {
        return <span>I{(props.index % 3) + 1}</span>;
    }
    return null;
}

function SamplesForm(props: {
    samples: Sample[];
    setSamples: (samples: Sample[]) => void;
}) {
    return (
        <div className="w-full">
            {props.samples.map((s, i) => (
                <div key={i} className="row my-2 flex w-full items-center">
                    <div className="mr-8 w-1/12 flex-none text-right font-bold">
                        {i < 6 ? (
                            <SampleTooltip index={i}>
                                <SampleName index={i} />:
                            </SampleTooltip>
                        ) : (
                            <button
                                className="aspect-square rounded border-2 border-orange-700 bg-orange-500 p-2 text-center text-white hover:bg-orange-600"
                                onClick={() =>
                                    props.setSamples(
                                        produce(props.samples, (draft) => {
                                            draft.splice(i, 1);
                                        })
                                    )
                                }
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                    <div className="mr-8 flex items-center p-1">
                        Expected: 
                        <TextInput
                            value={s.expected}
                            onChange={(e) =>
                                props.setSamples(
                                    produce(props.samples, (draft) => {
                                        try {
                                            draft[i].expected = parseFloat(
                                                e.target.value
                                            );
                                        } catch {}
                                    })
                                )
                            }
                            type="number"
                            className="text-center"
                            disabled={i < 6}
                        />
                         mm
                    </div>
                    <div className="mr-8 flex items-center p-1">
                        <SampleTooltip index={i}>Measured: </SampleTooltip>
                        <TextInput
                            value={s.measured}
                            onChange={(e) =>
                                props.setSamples(
                                    produce(props.samples, (draft) => {
                                        try {
                                            draft[i].measured = parseFloat(
                                                e.target.value
                                            );
                                        } catch {}
                                    })
                                )
                            }
                            type="number"
                            className="text-center"
                        />
                         mm
                    </div>
                    <div className="flex-none items-center p-1">
                        <ToggleSwitch
                            checked={s.inner}
                            disabled={i < 6}
                            label="Inner dimension"
                            onChange={() => {
                                props.setSamples(
                                    produce(props.samples, (draft) => {
                                        draft[i].inner = !draft[i].inner;
                                    })
                                );
                            }}
                        />
                    </div>
                </div>
            ))}
            <button
                className="my-2 w-full rounded border-2 border-blue-800 bg-blue-500 p-1 hover:bg-blue-600"
                onClick={() =>
                    props.setSamples(
                        produce(props.samples, (draft) => {
                            draft.push({
                                expected: 100,
                                measured: Number.NaN,
                                inner: false,
                            });
                        })
                    )
                }
            >
                Add extra measurement sample
            </button>
        </div>
    );
}
