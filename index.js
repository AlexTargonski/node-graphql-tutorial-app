import express         from 'express';
import bodyParser      from 'body-parser';
import graphqlHttp     from 'express-graphql';
import { buildSchema } from 'graphql';

const PORT = 8080;
const app  = express();

app.use(bodyParser.json());

app.use(
  '/graphiql', 
  graphqlHttp({
  schema    : buildSchema(`
     type RootQuery {
       events: [String!]!
      }
      type RootMutation {
        createEvent(name: String): String
      }
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue : {
        events : () => {
          return ['event1', 'event2'];
        },
        createEvent : (args) => {
          const eventName = args.name;
          return eventName;
        }
      },
    graphiql  : true
}));

app.listen(PORT, () => console.log(`Server Now Running On localhost:${PORT}/graphiql`));
