import { Router } from "..";

describe("Router", () => {
  describe("#isPathMatching", () => {
    it("should return false when path and url have different number of segments", () => {
      const router = new Router();
      expect(router.isPathMatching("/foo", "/foo/bar")).toBe(false);
    });

    it("should return false when path and url have different segments", () => {
      const router = new Router();
      expect(router.isPathMatching("/foo/bar", "/bar/foo")).toBe(false);
    });

    it("should return true when path and url have same segments", () => {
      const router = new Router();
      expect(router.isPathMatching("/foo/bar", "/foo/bar")).toBe(true);
    });

    it("should return true when path and url have same segments and path has a parameter", () => {
      const router = new Router();
      expect(router.isPathMatching("/foo/:id", "/foo/bar")).toBe(true);
    });
  });

  describe("#findRoute", () => {
    it("should return undefined when no route is found", () => {
      const router = new Router();
      const request = { url: "/foo", method: "GET" };
      expect(router.findRoute(request)).toBeUndefined();
    });

    it("should return route when route is found", () => {
      const router = new Router();
      const request = { url: "/foo", method: "GET" };
      router.get("/foo", () => ({} as any));
      expect(router.findRoute(request)).toBeDefined();
    });

    it("should return route when url has query and hash", () => {
      const router = new Router();
      const request = { url: "/foo?bar#baz", method: "GET" };
      router.get("/foo", () => ({} as any));
      expect(router.findRoute(request)).toBeDefined();
    });
  });

  describe("#onRequest", () => {
    it("should return 404 when no route is found", async () => {
      const router = new Router();
      jest.spyOn(router, "findRoute").mockReturnValue(undefined);
      const request = { url: "/foo", method: "GET" };
      const response = await router.onRequest(request);
      expect(response!.statusCode).toBe(404);
    });

    it("should return response when route is found", async () => {
      const router = new Router();
      const expected = {};
      jest.spyOn(router, "findRoute")
        .mockReturnValue({
          handler: jest.fn().mockReturnValue(expected)
        } as any);
      const request = { url: "/foo", method: "GET" };
      const actual = await router.onRequest(request);
      expect(actual).toBe(expected);
    });
  });
});
