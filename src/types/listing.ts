export interface ListingAttributes {
    [key: string]: string | number | boolean | undefined; // Allow for various attribute types
    Producer?: string;
    "Producer Type"?: string;
    "Baxus Class ID"?: string;
    Size?: string;
    "Baxus Class Name"?: string;
    "Original Cask Yield"?: string | number;
    "Cask Type"?: string;
    Name?: string;
    Series?: string;
    Type?: string;
    ABV?: string | number;
    "Year Bottled"?: string | number;
    PackageShot?: boolean;
    Packaging?: string;
    Country?: string;
    Region?: string;
    Blurhash?: string;
    "Bottle Number"?: string;
}

export interface ListingSource {
    lastHeartbeat: string | null;
    blurhash: string;
    index: string;
    description: string;
    listedDate: string; // ISO date string
    packageShot: boolean;
    spiritType: string;
    isListed: boolean;
    nftAddress: string;
    price: number;
    imageUrl: string;
    name: string;
    attributes: ListingAttributes;
    id: string;
    ownerAddress: string;
}

export interface ListingResponseItem {
    _index: string;
    _id: string;
    _score: number;
    _ignored?: string[];
    _source: ListingSource;
}

// We typically only care about the _source data
export type Listing = ListingSource;
