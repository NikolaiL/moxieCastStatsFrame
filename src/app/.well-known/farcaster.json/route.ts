export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjM2NjcxMywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDlFOTIxODc5NEI2MDI0QjBFOTJkQjFjZkIzMDY4MDE2NzgwOTIwNDUifQ",
      payload: "eyJkb21haW4iOiJtb3hpZS1jYXN0LXN0YXRzLWZyYW1lLnZlcmNlbC5hcHAifQ",
      signature:
        "MHhkMTA1NGU5MDA1NWViODczYTI5MDZhNGY0ZDVjYzI2ZGQ0Yzk5NTc3Njc0NzkzMWMzNDhiNzAwZDUwYzZiNDMyNmYzNDk1ODE0NTQzOGYzNmEyNDU1YmNkYmRiZWIyMjY5OWFkMDljNTc4YTI0NzFkM2EzYzFlNzg1NzRhMDE2MTFj",
    },
    frame: {
      version: "0.0.0",
      name: "Cast Earnings Stats Frame",
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#581C87",
      homeUrl: appUrl,
    },
  };

  return Response.json(config);
}
