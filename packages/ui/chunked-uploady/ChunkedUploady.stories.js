// @flow
import React from "react";
// $FlowFixMe - for some reason flow doesnt see @storybook/addon-knobs is installed...
import { number } from "@storybook/addon-knobs"
import UploadButton from "@rpldy/upload-button";
import ChunkedUploady, { useRequestPreSend } from "./src"
import {
    withKnobs,
    useStoryUploadySetup,
    StoryUploadProgress,
    StoryAbortButton,
} from "../../../story-helpers";

const UploadButtonWithUniqueIdHeader = () => {
    useRequestPreSend((data) => {
        return {
            options: {
                destination: {
                    headers: {
                        "X-Unique-Upload-Id": `rpldy-chunked-uploader-${Date.now()}`,
                    }
                }
            }
        };
    });

    return <UploadButton/>
};

const useChunkedStoryHelper = () => {
    const setup = useStoryUploadySetup({ noGroup: true });
    const chunkSize = number("chunk size (bytes)", 5242880);

    return { ...setup, chunkSize };
};

export const Simple = () => {
    const { enhancer, destination, multiple, chunkSize } = useChunkedStoryHelper();

    return <ChunkedUploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        chunkSize={chunkSize}>
        <UploadButtonWithUniqueIdHeader/>
    </ChunkedUploady>;
};

export const WithProgress = () => {
    const { enhancer, destination, multiple, chunkSize } = useChunkedStoryHelper();

    return <ChunkedUploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        chunkSize={chunkSize}>
        <StoryUploadProgress/>
        <UploadButtonWithUniqueIdHeader/>
    </ChunkedUploady>;
};

export const WithAbortButton = () => {
    const { enhancer, destination, multiple, chunkSize } = useChunkedStoryHelper();

    return <ChunkedUploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        chunkSize={chunkSize}>
        <UploadButtonWithUniqueIdHeader/>
        <br/>
        <StoryAbortButton/>
    </ChunkedUploady>
};

export default {
    component: UploadButton,
    title: "Chunked Uploady",
    decorators: [withKnobs],
};
