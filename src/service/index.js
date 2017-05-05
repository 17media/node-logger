import SlackLogger from './slack';
import FluentdLogger from './fluentd';
import ConsoleLogger from './console';

const services = {
  SlackLogger,
  FluentdLogger,
  ConsoleLogger,
};

export default services;
