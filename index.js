import express         from 'express';
import bodyParser      from 'body-parser';
import graphqlHttp     from 'express-graphql';
import { buildSchema } from 'graphql';

const PORT = 8080;
const app  = express();

app.use(bodyParser.json());

const events = [];

app.use(
  '/graphiql',
  graphqlHttp({
  schema    : buildSchema(`
      type Event {
        _id: ID!
        title: String!
        desc: String!
        price: Float!
        date: String!
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
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue : {
        events : () => {
          return events;
        },
        createEvent: args => {
        const event = {
          _id: Math.random().toString(),
          title: args.eventInput.title,
          desc: args.eventInput.desc,
          price: +args.eventInput.price,
          date: args.eventInput.date
        };
        events.push(event);
        return event;
      }
    },
    graphiql  : true
}));

app.listen(PORT, () => console.log(`Server Now Running On localhost:${PORT}/graphiql`));
