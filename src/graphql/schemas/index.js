import { buildSchema } from 'graphql';

module.exports = buildSchema(`
  type Booking {
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    password: String
    createdEvents: [Event!]
  }

  type Event {
    _id: ID!
    title: String!
    desc: String!
    price: Float!
    date: String!
    creator: User!
  }

  input UserInput {
    email: String!
    password: String!
  }

  input EventInput {
    title: String!
    desc: String!
    price: Float!
    date: String!
  }

  type LoginData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }

 type RootQuery {
   events: [Event!]!
   bookings: [Booking!]!
   login(email: String!, password: String!): LoginData!
  }

  type RootMutation {
    createEvent(eventInput: EventInput): Event
    createUser(userInput: UserInput): User
    bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
