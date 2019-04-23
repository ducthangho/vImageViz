import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare function logExceptions(): MethodDecorator;
export declare class VisualSettings extends DataViewObjectsParser {
    imageOptions: imageSettings;
}
export declare class imageSettings {
    circle: boolean;
    borderColor: string;
    borderWidth: number;
}
