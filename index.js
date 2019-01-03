import express    from 'express';
import bodyParser from 'body-parser';

const PORT = 8080;
const app  = express();

app.use(bodyParser.json());

app.listen(PORT, () => console.log(`Server Now Running On localhost:${PORT}/graphiql`));
