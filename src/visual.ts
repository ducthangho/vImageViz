    import "@babel/polyfill";
    import "./../style/visual.less";
    import powerbi from "powerbi-visuals-api";
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataView = powerbi.DataView;
    import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
    import PrimitiveValue = powerbi.PrimitiveValue;
    import hexToRgba from 'hex-to-rgba';
    import * as Highcharts from 'highcharts';   

    import {
        VisualSettings,
        logExceptions
    } from "./settings";


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
        private imageContainer: HTMLElement;
        private imageHolder : HTMLElement;
        private chartContainer : HTMLElement;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.updateCount = 0;
            this.imageContainer = null;
            this.imageHolder = null;
            this.chartContainer = null;
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {

            // debugger;
            //this.target.innerHTML = `<p>Update count: <em>${(this.updateCount++)}</em></p>`;
            this.settings = ImageVisual.parseSettings(options && options.dataViews && options.dataViews[0]);

            // while (this.target.firstChild) {
            //     this.target.removeChild(this.target.firstChild);
            // }

            let image: PrimitiveValue;
            let dataView = options.dataViews[0];

            let timeVals: Array < any > ;            
            let values: Array < any > ;           
            let images: Array < any > ;
            let colors: Array < any > ;
            // let Highcharts = ( < any > window).Highcharts;
            let maxLocal: number;
            let minLocal: number;

            if (dataView && dataView.categorical && dataView.categorical.categories != undefined) {
                if (dataView.metadata.columns[0].type.dateTime) {
                    // TODO: Put some code here
                    dataView.categorical.categories[0].values.forEach(function(element) {
                        // statements  
                        let d = Date.parse(String(element));
                        if (timeVals) {
                            timeVals.push(d);
                        } else timeVals = [d];
                        // console.log(d.toString());
                    });

                } else timeVals = dataView.categorical.categories[0].values;
            }
           

            // console.log(images);
            if (dataView && dataView.categorical && dataView.categorical.values != undefined && dataView.categorical.values.length > 0) {
                images = dataView.categorical.values[0].values;
            }

            // console.log(images);
            if (dataView && dataView.categorical && dataView.categorical.values != undefined && dataView.categorical.values.length > 1) {                    
                values = dataView.categorical.values[1].values;
                maxLocal = Number(dataView.categorical.values[1].maxLocal);
                minLocal = Number(dataView.categorical.values[1].minLocal);
            }

            if (dataView && dataView.categorical && dataView.categorical.values != undefined && dataView.categorical.values.length > 2) {                    
                colors = dataView.categorical.values[2].values;                
            }

                       
            let map = new Map();

            if (timeVals)
                for (let i = 0; i < timeVals.length; ++i) {
                    let key = timeVals[i];
                    let val = (values && i < values.length) ? values[i] : null;
                    if (key && val)
                        map.set(key, {
                            img: images[i],
                            val: val,
                            col: colors[i]
                        });
                }

            let data = [];

            let sortedMap = new Map([...map].sort((a, b) => a[0] === b[0] ? 0 : a[0] > b[0] ? -1 : 1)); //sort in reverse order
            let latest = (sortedMap && sortedMap.size > 0) ? sortedMap.values().next().value : null;
            let latestKey = (sortedMap && sortedMap.size > 0) ? sortedMap.keys().next().value : null;

            let vals = sortedMap ? Array.from(sortedMap.values()) : [];
            let keys = sortedMap ? Array.from(sortedMap.keys()) : [];
            let color = "";

            for (let i = sortedMap.size - 1; i >= 0; --i) {
                let v = vals[i];
                let k = keys[i];
                if (i > 0) {
                    data.push({
                        x: k,
                        y: v.val
                    });
                } else {
                    color = v.col;
                    data.push({
                        marker: {
                            fillColor: 'rgba(239, 251, 246, 0.5)',
                            lineWidth: 5,
                            lineColor: "rgba(239, 251, 246, 0.5)" // inherit from series
                        },
                        x: k,
                        y: v.val
                    });
                    
                }

            }

            // console.log('Latest = ',latest, 'Key = ', latestKey);
            console.log('Color ',color);
            image = (latest) ? latest.img : images && images.length > 0 ? images[0] : null;
            let rgba = hexToRgba(color);
            let colorsOnly = rgba.substring(rgba.indexOf('(') + 1, rgba.lastIndexOf(')')).split(/,\s*/);
            let red = parseInt(colorsOnly[0]);
            let green = parseInt(colorsOnly[1]);
            let blue = parseInt(colorsOnly[2]);
            let opacity = parseFloat(colorsOnly[3]);

            let isCyan = (green>200 && blue>225);
            let isRed = (red>200);
            let isGreen = (green>225);

            let stopColor1 = (isGreen) ? "#b4f1c7" : (isRed) ? "#ffa9d5" : "#00b1ff";
            let stopColor2 = (isGreen) ? "#60ac78" : (isRed) ? "#984871" : "#5f51f5"

            if (image != null) {

                if (!this.imageContainer){                    
                    this.imageContainer = document.createElement("div");                    
                    this.imageContainer.classList.add("image-container");
                    this.target.appendChild(this.imageContainer);                    
                }
                

                let imageUrl = image.toString();

                if (startsWith(imageUrl, "<svg ")) { //inline svg
                    this.imageContainer.innerHTML = imageUrl;
                    // console.log("Inlined");
                } else {
                    let oImg = (!this.imageHolder) ? document.createElement("img") : this.imageHolder;
                    oImg.setAttribute("alt", "");
                    oImg.setAttribute("src", encodeSVG(imageUrl));
                    // console.log('Set new src ', oImg);
                    // console.log('Image ', encodeSVG(imageUrl));
                    if (!this.imageHolder) document.body.appendChild(oImg);

                    if (!this.imageHolder && this.settings.imageOptions.circle) {
                        oImg.classList.add("circle")
                    }

                    if (this.settings.imageOptions.borderWidth > 0) {
                        let desiredWidth = (options.viewport.width - (this.settings.imageOptions.borderWidth * 2)).toFixed(0); {
                            oImg.setAttribute("style", `width: ${desiredWidth}px; border-style: solid; border-width: ${this.settings.imageOptions.borderWidth}px; border-color: ${this.settings.imageOptions.borderColor}`);
                        }
                    } else {
                        oImg.setAttribute("style", `width: ${options.viewport.width.toFixed(0)}px;`);
                    }

                    if (!this.imageHolder) {
                        this.imageContainer.appendChild(oImg);                                                
                    }
                    this.imageHolder = oImg;

                }
                

                // console.log('DATA ',data);
                if (data) {
                    if (!this.chartContainer) {
                        this.chartContainer = document.createElement("div");
                        this.chartContainer.classList.add("chart-container");
                        this.chartContainer.classList.add("minichart");
                        // this.chartContainer.setAttribute("id", "minichart");
                        this.imageContainer.appendChild(this.chartContainer);
                    }

                    Highcharts.setOptions({
                        chart: {
                            margin: [0, 0, 0, 0],
                            animation: false,
                            // zoomType: 'x',
                            style: {
                                overflow: 'visible'
                            },
                            backgroundColor: 'transparent',
                            plotBackgroundColor: 'transparent',
                            plotShadow: false,
                        },
                        title: {
                            text: ''
                        },
                        credits: {
                            enabled: false
                        },
                        legend: {
                            enabled: false
                        },
                        xAxis: {
                            visible: false,
                            labels: {
                                enabled: false
                            },
                            tickLength: 0
                        },
                        yAxis: {
                            title: {
                                text: null
                            },
                            maxPadding: 0,
                            minPadding: 0,
                            gridLineWidth: 0,
                            endOnTick: false,
                            labels: {
                                enabled: false
                            },
                            min: minLocal,
                            max: maxLocal
                        },
                        plotOptions: {
                            area: {
                                enableMouseTracking: false,
                                color: {
                                    linearGradient: {
                                        x1: 0,
                                        y1: 0,
                                        x2: 0,
                                        y2: 1
                                    },
                                    stops: [
                                        [0, stopColor1],
                                        [1, stopColor2]
                                    ]
                                },

                                fillColor: {
                                    linearGradient: {
                                        x1: 0,
                                        y1: 0,
                                        x2: 0,
                                        y2: 1
                                    },
                                    stops: [
                                        [0, hexToRgba(stopColor1,0.12)],
                                        [1, hexToRgba(stopColor2,0.12)]
                                    ]
                                },

                                marker: {
                                    radius: 2
                                },
                                // lineWidth: 2,
                                threshold: null
                            }
                        },
                    });

                    Highcharts.chart( {
                        chart: {
                            renderTo: this.chartContainer,                           
                            // styledMode: true,                           
                        },

                        yAxis: {                            
                            min: minLocal,
                            max: maxLocal
                        },

                        series: [{
                            type: 'area',
                            animation: false,
                            shadow: {
                                color: stopColor2,
                                width: 5,
                                offsetX: 0,
                                offsetY: 0
                            },
                            name: '',
                            alignTicks: false,
                            data: data
                        }]
                    });
                    // console.log(data);
                }
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

        public destroy(): void {
        //one time cleanup code goes here (called once)
            console.log('Destroyed');
        }
    }