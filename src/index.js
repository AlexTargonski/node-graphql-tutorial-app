import express          from 'express';
import bodyParser       from 'body-parser';
import graphqlHttp      from 'express-graphql';
import mongoose         from 'mongoose';

import graphQlSchemas   from './graphql/schemas';
import graphQlResolvers from './graphql/resolvers';
import auth             from './graphql/middlewares/auth';

const PORT = 8080;
const app  = express();

app.use(bodyParser.json());

app.use(auth);

app.use(
  '/graphiql',
  graphqlHttp({
    schema    : graphQlSchemas,
    rootValue : graphQlResolvers,
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
