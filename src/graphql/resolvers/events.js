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

  createEvent : async args => {
    const event = new Event({
      title   : args.eventInput.title,
      desc    : args.eventInput.desc,
      price   : +args.eventInput.price,
      date    : new Date(args.eventInput.date),
      creator : '5c3edd3e269a4531786f8ff6'
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = modify(result);
      const creator = await User.findById('5c3edd3e269a4531786f8ff6');

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
