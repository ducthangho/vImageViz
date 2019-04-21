module powerbi.extensibility.visual.vImage9A4E60DA8D8644E6856BE871F0717518  {
    "use strict";

    const externalQuotesValue = 'double';
    const symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;


    let quotes = getQuotes();

    // Namespace
    //----------------------------------------

    function addNameSpace(data) {
        if (data.indexOf('http://www.w3.org/2000/svg') < 0) {
            data = data.replace(/<svg/g, `<svg xmlns=${quotes.level2}http://www.w3.org/2000/svg${quotes.level2}`);
        }

        return data;
    }


    // Encoding
    //----------------------------------------

    function encodeSVG(data) {
        // Use single quotes instead of double to avoid encoding.
        if (externalQuotesValue === 'double') {
            data = data.replace(/"/g, '\'');
        } else {
            data = data.replace(/'/g, '"');
        }

        data = data.replace(/>\s{1,}</g, "><");
        data = data.replace(/\s{2,}/g, " ");

        return data.replace(symbols, encodeURIComponent);
    }


    // Get quotes for levels
    //----------------------------------------

    function getQuotes() {
        const double = `"`;
        const single = `'`;

        return {
            level1: externalQuotesValue === 'double' ? double : single,
            level2: externalQuotesValue === 'double' ? single : double
        };
    }

    // Common
    //----------------------------------------

    function startsWith(str, word) {
        return str.lastIndexOf(word, 0) === 0;
    }

    function out(data) {
        console.log(data);
    }

    export class ImageVisual implements IVisual {
        private target: HTMLElement;
        private settings: VisualSettings;
        private dataView: DataView;
        private updateCount: number;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.updateCount = 0;
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {

            // debugger;
            //this.target.innerHTML = `<p>Update count: <em>${(this.updateCount++)}</em></p>`;
            this.settings = ImageVisual.parseSettings(options && options.dataViews && options.dataViews[0]);

            while (this.target.firstChild) {
                this.target.removeChild(this.target.firstChild);
            }

            let image: PrimitiveValue;
            let dataView = options.dataViews[0];

            if (dataView && dataView.categorical && dataView.categorical.categories != undefined) {
                image = dataView.categorical.categories[0].values[0];
            } else if (dataView && dataView.categorical && dataView.categorical.values != undefined) {
                image = dataView.categorical.values[0].values[0];
            }


            if (image != null) {

                let imageContainer = document.createElement("div");
                imageContainer.classList.add("image-container")

                let imageUrl = image.toString();

                if (startsWith(imageUrl,"<svg ")) { //inline svg
                    imageContainer.innerHTML = imageUrl;
                    // console.log("Inlined");
                } else {
                    let oImg = document.createElement("img");
                    oImg.setAttribute("alt", "");
                    oImg.setAttribute("src", encodeSVG(imageUrl));
                    // console.log('Image ', encodeSVG(imageUrl));
                    document.body.appendChild(oImg);

                    if (this.settings.imageOptions.circle) {
                        oImg.classList.add("circle")
                    }

                    if (this.settings.imageOptions.borderWidth > 0) {
                        let desiredWidth = (options.viewport.width - (this.settings.imageOptions.borderWidth * 2)).toFixed(0); {
                            oImg.setAttribute("style", `width: ${desiredWidth}px; border-style: solid; border-width: ${this.settings.imageOptions.borderWidth}px; border-color: ${this.settings.imageOptions.borderColor}`);
                        }
                    } else {
                        oImg.setAttribute("style", `width: ${options.viewport.width.toFixed(0)}px;`);
                    }

                    imageContainer.appendChild(oImg);
                }

                this.target.appendChild(imageContainer);
            } else {
                console.log('Image was null');
            }
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {

            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'imageOptions':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            borderColor: this.settings.imageOptions.borderColor,
                            borderWidth: this.settings.imageOptions.borderWidth,
                            circle: this.settings.imageOptions.circle
                        },
                        validValues: {
                            borderWidth: {
                                numberRange: {
                                    min: 0,
                                    max: 20
                                }
                            }
                        },
                        selector: null
                    });
                    break;
            };

            return objectEnumeration;
        }
    }
}