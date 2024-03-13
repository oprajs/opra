import * as Action_ from './http/action.interface.js';
import * as Endpoint_ from './http/endpoint.interface.js';
import * as MediaContent_ from './http/media-content.interface.js';
import * as Operation_ from './http/operation.interface.js';
import * as Parameter_ from './http/parameter.interface.js';
import * as RequestBody_ from './http/request-body.interface.js';
import * as Resource_ from './http/resource.interface.js';
import * as Response_ from './http/response.interface.js';
import * as Service_ from './http/service.interface.js';

export namespace Http {

  export import Action = Action_.Action;
  export import Endpoint = Endpoint_.Endpoint;
  export import MediaContent = MediaContent_.MediaContent;
  export import Operation = Operation_.Operation;
  export import Parameter = Parameter_.Parameter;
  export import KeyParameter = Parameter_.KeyParameter;
  export import RequestBody = RequestBody_.RequestBody;
  export import Resource = Resource_.Resource;
  export import Response = Response_.Response;
  export import Service = Service_.Service;
  export import HttpRoot = Service_.HttpRoot;

}
