import { configure } from 'enzyme/build';
import Adapter from 'enzyme-adapter-react-16/build';

require('babel-polyfill');

configure({
  adapter: new Adapter(),
});
