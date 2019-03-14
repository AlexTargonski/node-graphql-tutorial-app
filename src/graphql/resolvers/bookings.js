import Booking                   from '../../models/booking';
import Event                     from '../../models/event';
import dateToString              from '../helpers/date';
import { modifyBooking, modify } from '../helpers/merge';

export default {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const bookings = await Booking.find({user: req.userId});
      return bookings.map(booking => {
        return modifyBooking(booking);
      });
    } catch (err) {
      console.log(err)
      throw err;
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    const fetchedEvent = await Event.findOne({ _id : args.eventId });
    const booking = new Booking({
      user  : req.userId,
      event : fetchedEvent
    });
    const result = await booking.save();
    return modifyBooking(result);
  },

  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = modify(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
