// Initializes the `hub-connector` service on path `/hub-connector`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { HubConnector } from './hub-connector.class';
import hooks from './hub-connector.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'hub-connector': HubConnector & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/hub-connector', new HubConnector(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('hub-connector');

  service.hooks(hooks);
}
