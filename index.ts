export type Request = {
  url: string;
  method: string;
  headers?: {
    [key: string]: string;
  };
  body?: string;
}

export type Response = {
  statusCode: number;
  headers: {
    [key: string]: string;
  };
  body: string;
}

export class ResponseBuilder {

  static ok(): ResponseBuilder {
    return new ResponseBuilder().statusCode(200);
  }

  static notFound(): ResponseBuilder {
    return new ResponseBuilder().statusCode(404);
  }

  static internalServerError(): ResponseBuilder {
    return new ResponseBuilder().statusCode(500);
  }

  static builder() {
    return new ResponseBuilder();
  }

  private _statusCode = 200;
  private _headers = {};
  private _body = "";

  statusCode(statusCode: number): ResponseBuilder {
    this._statusCode = statusCode;
    return this;
  }

  header(key: string, value: string): ResponseBuilder {
    this._headers = { ...this._headers, [key]: value };
    return this;
  }

  headers(headers: { [key: string]: string }): ResponseBuilder {
    this._headers = { ...this._headers, ...headers };
    return this;
  }

  body(body: string): ResponseBuilder {
    this._body = body;
    return this;
  }

  build(): Response {
    return {
      statusCode: this._statusCode,
      headers: this._headers,
      body: this._body,
    };
  }
}

export type Route = {
  path: string;
  method: string;
  handler: Handler;
}

export type Handler = (request: Request) => Promise<Response> | Response;

export class Router {
  routes: Route[] = [];
  middlewares: Handler[] = [];

  on(path: string, method: string, handler: Handler): Router {
    this.routes.push({ path, method, handler });
    return this;
  }

  get(path: string, handler: Handler): Router {
    return this.on(path, "GET", handler);
  }

  onRequest(request: Request): Promise<Response> | Response {
    const route = this.findRoute(request);
    if (route == null) {
      return ResponseBuilder.notFound().build();
    }
    return route.handler(request);
  }

  findRoute(request: Request): Route | undefined {
    const { url, method } = request;
    const methodMatched = this.routes.filter(it => it.method === method);
    return methodMatched.find(it => this.isPathMatching(it.path, url.split("#")[0].split("?")[0]));
  }

  isPathMatching(path: string, url: string): boolean {
    const pathSegments = path.split("/");
    const urlSegments = url.split("/");
    if (pathSegments.length !== urlSegments.length) {
      return false;
    }
    for (let i = 0; i < pathSegments.length; i++) {
      const pathSegment = pathSegments[i];
      const urlSegment = urlSegments[i];
      if (pathSegment.startsWith(":")) {
        continue;
      }
      if (pathSegment !== urlSegment) {
        return false;
      }
    }
    return true;
  }
}
