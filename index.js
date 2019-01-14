import express         from 'express';
import bodyParser      from 'body-parser';
import graphqlHttp     from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose        from 'mongoose';

import Event           from './models/event';

const PORT = 8080;
const app  = express();

app.use(bodyParser.json());

const events = [];

app.use(
  '/graphiql',
  graphqlHttp({
  schema    : buildSchema(`
      type User {
        _id: ID!
        email: String!
        password: String
      }

      type Event {
        _id: ID!
        title: String!
        desc: String!
        price: Float!
        date: String!
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

     type RootQuery {
       events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue : {
          events: () => {
            return Event.find()
              .then(events => {
                return events.map(event => {
                  return { ...event._doc, _id: event.id };
                });
              })
              .catch(err => {
                throw err;
          });
        },
        createEvent: args => {
          const event = new Event({
            title: args.eventInput.title,
            desc: args.eventInput.desc,
            price: +args.eventInput.price,
            date: args.eventInput.date,
          });
          return event
          .save()
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result._doc._id.toString() };
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      }
    },
    graphiql  : true
}));

mongoose
  .connect(
    `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0-zmw7e.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => {
    app.listen(PORT, () => console.log(`Server Now Running On localhost:${PORT}/graphiql`));
  })
  .catch(err => {
    console.log(err);
});
