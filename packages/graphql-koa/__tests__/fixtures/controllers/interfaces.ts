export interface Photo {
  id: number;
  name: string;
  description: string;
  fileName: string;
  views: number;
  isPublished: boolean;
}

export interface Hero {
  id: number;

  name: string;

  power: string;
  amountPeopleSaved: number;
}
