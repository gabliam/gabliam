export const PhotoSchema = `
type Photo {
  id: Int!

  name: String!

  description: String!

  fileName: String!

  views: Int!

  isPublished: Boolean!
}

input PhotoInput {
  name: String!

  description: String!

  fileName: String!

  views: Int!

  isPublished: Boolean!
}

type PhotoPage {
  items: [Photo]
  totalCount: Int
}

type Query {
  photos: [Photo]
  getPageOfPhotos(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: String): PhotoPage
}

type Mutation {
  submitPhoto(photoInput: PhotoInput!): Photo
}
`;

export const HeroSchema = `
type Hero {
  id: Int!

  name: String!

  power: String!

  amountPeopleSaved: Int!
}

input HeroInput {
  name: String!

  power: String!

  amountPeopleSaved: Int!
}

type HeroPage {
  items: [Hero]
  totalCount: Int
}

type Query {
  heroes: [Hero]
  getPageOfHeroes(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: String): HeroPage
}

type Mutation {
  submitHero(heroInput: HeroInput!): Hero
}
`;
