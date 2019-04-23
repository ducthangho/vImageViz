import { ImageVisual } from "../../src/visual";
var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];

var ImageViz = {
    name: 'ImageViz',
    displayName: 'ImageViz',
    class: 'ImageVisual',
    version: '1.0.0',
    apiVersion: '2.5.0',
    create: (options) => {
        if (ImageVisual) {
            return new ImageVisual(options);
        }

        console.error('Visual instance not found');
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["ImageViz"] = ImageViz;
}

export default ImageViz;