import { ImageVisual } from "../../src/visual";
declare var ImageViz: {
    name: string;
    displayName: string;
    class: string;
    version: string;
    apiVersion: string;
    create: (options: any) => ImageVisual;
    custom: boolean;
};
export default ImageViz;
