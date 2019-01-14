import express         from 'express';
import bodyParser      from 'body-parser';
import graphqlHttp     from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose        from 'mongoose';
import bcrypt          from 'bcryptjs';

import Event           from './models/event';
import User            from './models/user';

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
        createEvent : args => {
            const event = new Event({
              title   : args.eventInput.title,
              desc    : args.eventInput.desc,
              price   : +args.eventInput.price,
              date    : args.eventInput.date,
              creator : '5c3c98738a5b9658917d1e7a',
            });
            let createdEvent;
            return event
              .save()
              .then(result => {
                createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                return User.findById('5c3c98738a5b9658917d1e7a');
              })
              .then(user => {
                if (!user) {
                  throw new Error('User not found.');
                }
                user.createdEvents.push(event);
                return user.save();
              })
              .then(result => {
                return createdEvent;
              })
              .catch(err => {
                console.log(err);
                throw err;
            });
        },
        createUser : args => {
          return User.findOne({ email: args.userInput.email })
            .then(user => {
              if (user) {
                throw new Error('User already exists.');
              }
              return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {
              const user = new User({
                email: args.userInput.email,
                password: hashedPassword
              });
              return user.save();
            })
            .then(result => {
              return { ...result._doc, password: null, _id: result.id };
            })
            .catch(err => {
              throw err;
            });
        },
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
