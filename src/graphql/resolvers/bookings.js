import Booking       from '../../models/booking';
import Event         from '../../models/event';
import dateToString  from '../helpers/date';
import { modifyBooking } from '../helpers/merge';

export default {
  bookings : async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return modifyBooking(booking);
      });
    } catch (err) {
      console.log(err)
      throw err;
    }
  },

  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id : args.eventId });
    const booking = new Booking({
      user  : '5c3edd3e269a4531786f8ff6',
      event : fetchedEvent
    });
    const result = await booking.save();
    return modifyBooking(result);
  },

  cancelBooking: async args => {
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
