import eventsResolver  from './events';
import userResolver    from './user';
import bookingResolver from './bookings';

const rootResolver = {
  ...userResolver,
  ...eventsResolver,
  ...bookingResolver
};

export default rootResolver;
