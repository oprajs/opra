import {DeepPartial, DeepPickJson, DeepPickWritable, Type} from 'ts-gems';


export declare type PartialInput<T> = DeepPartial<DeepPickWritable<DeepPickJson<T>>>;
export declare type PartialOutput<T> = DeepPartial<DeepPickJson<T>>;
