import dateToString from '../helpers/date';
import { modify }   from '../helpers/merge';
import User         from '../../models/user';
import Event        from '../../models/event';

export default {
  events : async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return modify(event);
      });
    } catch (err) {
      throw err;
    }
  },

  createEvent : async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    const event = new Event({
      title   : args.eventInput.title,
      desc    : args.eventInput.desc,
      price   : +args.eventInput.price,
      date    : new Date(args.eventInput.date),
      creator : req.userId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = modify(result);
      const creator = await User.findById(req.userId);

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
};
