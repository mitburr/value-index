export function sayHelloWorld(world: string) {
  return `Hello ${world}`;
}

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
      return new Response("Welcome to Bun!");
  }
});

console.log(`Listening on http://localhost:${server.port}`);
