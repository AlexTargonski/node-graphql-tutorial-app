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

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

app.use(
  '/graphiql',
  graphqlHttp({
  schema    : buildSchema(`
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
      events: async () => {
        try {
          const events = await Event.find();
          return events.map(event => {
            return {
              ...event._doc,
              _id     : event.id,
              date    : new Date(event._doc.date).toISOString(),
              creator : user.bind(this, event._doc.creator)
            };
          });
        } catch (err) {
          throw err;
        }
      },
      createEvent: async args => {
        const event = new Event({
          title   : args.eventInput.title,
          desc    : args.eventInput.desc,
          price   : +args.eventInput.price,
          date    : new Date(args.eventInput.date),
          creator : '5c3c98738a5b9658917d1e7a'
        });
        let createdEvent;
        try {
          const result = await event.save();
          createdEvent = {
            ...result._doc,
            _id     : result._doc._id.toString(),
            date    : new Date(event._doc.date).toISOString(),
            creator : user.bind(this, result._doc.creator)
          };
          const creator = await User.findById('5c3c98738a5b9658917d1e7a');

          if (!creator) {
            throw new Error('User not found.');
          }
          creator.createdEvents.push(event);
          await creator.save();

          return createdEvent;
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
      createUser: async args => {
        try {
          const existingUser = await User.findOne({ email: args.userInput.email });
          if (existingUser) {
            throw new Error('User exists already.');
          }
          const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          });

          const result = await user.save();

          return { ...result._doc, password: null, _id: result.id };
        } catch (err) {
          throw err;
        }
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
