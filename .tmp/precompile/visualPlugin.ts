import { ImageVisual } from "../../src/visual";
var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];

var vImage9A4E60DA8D8644E6856BE871F0717518 = {
    name: 'vImage9A4E60DA8D8644E6856BE871F0717518',
    displayName: 'VImage',
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
    powerbi.visuals.plugins["vImage9A4E60DA8D8644E6856BE871F0717518"] = vImage9A4E60DA8D8644E6856BE871F0717518;
}

export default vImage9A4E60DA8D8644E6856BE871F0717518;